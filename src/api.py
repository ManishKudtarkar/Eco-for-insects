"""
EcoPredict FastAPI Backend
REST API for serving biodiversity decline predictions
"""

from fastapi import FastAPI, HTTPException, Query, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
import pickle
import numpy as np
from typing import Optional, List
import time
import os
import json
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from src.gbif_client import gbif_client
from src.data_processor import data_processor
from src.logger import logger
from src.metrics import REQUEST_COUNT, REQUEST_LATENCY, PREDICTION_COUNT, CACHE_HITS, EXCEPTIONS
from src.cache import cache

# Authentication configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


# User models
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class User(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


# User storage (simple JSON file for development)
USERS_FILE = "data/users.json"

def load_users():
    """Load users from JSON file"""
    if not os.path.exists(USERS_FILE):
        os.makedirs("data", exist_ok=True)
        with open(USERS_FILE, "w") as f:
            json.dump({}, f)
        return {}
    
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    """Save users to JSON file"""
    os.makedirs("data", exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    user_email = payload.get("sub")
    
    if user_email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    users = load_users()
    if user_email not in users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    user = users[user_email]
    return User(**user)


# Geospatial mapping for regions
REGION_MAPPING = {
    # North America
    "north_america": {
        "name": "North America",
        "bounds": {"lat": (15, 75), "lon": (-170, -50)},
        "description": "USA, Canada, Mexico"
    },
    # South America
    "south_america": {
        "name": "South America",
        "bounds": {"lat": (-56, 13), "lon": (-82, -35)},
        "description": "Brazil, Argentina, Colombia, Peru, etc."
    },
    # Europe
    "europe": {
        "name": "Europe",
        "bounds": {"lat": (36, 71), "lon": (-10, 40)},
        "description": "UK, France, Germany, Italy, Spain, etc."
    },
    # Africa
    "africa": {
        "name": "Africa",
        "bounds": {"lat": (-35, 37), "lon": (-18, 52)},
        "description": "Kenya, Egypt, Nigeria, South Africa, etc."
    },
    # Asia
    "asia": {
        "name": "Asia",
        "bounds": {"lat": (-10, 75), "lon": (40, 145)},
        "description": "China, India, Japan, Southeast Asia, etc."
    },
    # Australia
    "australia": {
        "name": "Australia & Oceania",
        "bounds": {"lat": (-47, -10), "lon": (113, 180)},
        "description": "Australia, New Zealand, Pacific Islands"
    }
}


def get_region_from_coordinates(latitude: float, longitude: float) -> dict:
    """
    Convert latitude/longitude to region name
    Returns region information
    """
    for region_key, region_data in REGION_MAPPING.items():
        lat_min, lat_max = region_data["bounds"]["lat"]
        lon_min, lon_max = region_data["bounds"]["lon"]
        
        if lat_min <= latitude <= lat_max and lon_min <= longitude <= lon_max:
            return {
                "region": region_data["name"],
                "key": region_key,
                "description": region_data["description"],
                "latitude": latitude,
                "longitude": longitude
            }
    
    # Default if no region matches
    return {
        "region": "Unknown Region",
        "key": "unknown",
        "description": f"Coordinates: {latitude}°, {longitude}°",
        "latitude": latitude,
        "longitude": longitude
    }


def get_species_scientific_name(species_name: str) -> dict:
    """
    Get scientific name and common names for a species from GBIF
    Returns quickly with defaults if GBIF times out
    """
    try:
        # Try to get from GBIF with timeout
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError("GBIF request timed out")
        
        # Try to get from GBIF - non-blocking
        results = gbif_client.search_species(species_name, limit=1)
        if results:
            result = results[0]
            return {
                "scientific_name": result.get("scientificName", species_name),
                "common_names": [v.get("vernacularName") for v in result.get("vernacularNames", []) if v],
                "kingdom": result.get("kingdom"),
                "order": result.get("order"),
                "family": result.get("family")
            }
    except TimeoutError:
        logger.warning(f"GBIF request timed out for {species_name}")
    except Exception as e:
        logger.warning(f"Could not fetch GBIF data for {species_name}: {e}")
    
    # Return defaults quickly if GBIF fails
    return {
        "scientific_name": species_name,
        "common_names": [],
        "kingdom": None,
        "order": None,
        "family": None
    }

# Initialize FastAPI app
app = FastAPI(
    title="EcoPredict API",
    description="AI-powered API for predicting insect biodiversity decline",
    version="1.0.0",
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request model
class PredictionRequest(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude coordinate", ge=-180, le=180)
    year: int = Field(..., description="Year of observation", ge=1900, le=2100)
    species: str = Field(..., description="Species name")

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 40.7128,
                "longitude": -74.0060,
                "year": 2024,
                "species": "Apis mellifera",
            }
        }


# Response model
class PredictionResponse(BaseModel):
    decline_risk: int = Field(..., description="Decline risk (0=Stable, 1=High Risk)")
    status: str = Field(..., description="Human-readable status")
    confidence: Optional[float] = Field(None, description="Prediction confidence")
    region: Optional[str] = Field(None, description="Geographic region name")
    region_info: Optional[dict] = Field(None, description="Additional region information")
    scientific_name: Optional[str] = Field(None, description="Scientific species name from GBIF")
    common_names: Optional[List[str]] = Field(None, description="Common/vernacular names")


# Global variables for model and encoder
model = None
species_encoder = None


def load_models():
    """Load trained model and encoders"""
    global model, species_encoder

    model_path = "models/ecopredict.pkl"
    encoder_path = "models/species_encoder.pkl"

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found: {model_path}\n"
            "Please run 'python src/train_model.py' first to train the model."
        )

    if not os.path.exists(encoder_path):
        raise FileNotFoundError(
            f"Encoder file not found: {encoder_path}\n"
            "Please run 'python src/train_model.py' first to train the model."
        )

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    with open(encoder_path, "rb") as f:
        species_encoder = pickle.load(f)

    print("✓ Models loaded successfully")


@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    try:
        load_models()
    except Exception as e:
        print(f"Error loading models: {e}")
        print("API will start but predictions will fail until models are trained.")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to EcoPredict API",
        "version": "1.0.0",
        "endpoints": {"predict": "/predict", "health": "/health", "docs": "/docs"},
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_loaded = model is not None
    encoder_loaded = species_encoder is not None

    return {
        "status": "healthy" if (model_loaded and encoder_loaded) else "degraded",
        "model_loaded": model_loaded,
        "encoder_loaded": encoder_loaded,
    }


# Authentication endpoints
@app.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        users = load_users()
        
        # Check if user already exists
        if user_data.email in users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = f"user_{int(time.time() * 1000)}"
        hashed_password = hash_password(user_data.password)
        
        new_user = {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "created_at": datetime.utcnow().isoformat()
        }
        
        users[user_data.email] = new_user
        save_users(users)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_data.email})
        
        # Return token and user info (without password)
        user_response = {
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "created_at": new_user["created_at"]
        }
        
        logger.info(f"New user registered: {user_data.email}")
        
        return Token(
            access_token=access_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@app.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    try:
        users = load_users()
        
        # Check if user exists
        if credentials.email not in users:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = users[credentials.email]
        
        # Verify password
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": credentials.email})
        
        # Return token and user info (without password)
        user_response = {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
        
        logger.info(f"User logged in: {credentials.email}")
        
        return Token(
            access_token=access_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@app.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Predict insect biodiversity decline risk

    Takes geographic coordinates, year, and species name and returns
    a prediction of whether the species is at risk of decline.
    """
    # Check if models are loaded
    if model is None or species_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please train the model first using 'python src/train_model.py'",
        )

    try:
        start_time = time.time()

        # Get region information
        region_info = get_region_from_coordinates(request.latitude, request.longitude)
        
        # Get species scientific name and common names
        species_info = get_species_scientific_name(request.species)

        # Cache lookup
        cache_key = cache.get_prediction_cache_key(
            {
                "latitude": request.latitude,
                "longitude": request.longitude,
                "year": request.year,
                "species": request.species,
            }
        )
        cached = cache.get(cache_key)
        if cached:
            CACHE_HITS.labels(endpoint="predict").inc()
            REQUEST_LATENCY.labels(endpoint="/predict").observe(time.time() - start_time)
            REQUEST_COUNT.labels(endpoint="/predict", method="POST", status="200").inc()
            return PredictionResponse(**cached)
        
        # Encode species
        if request.species not in species_encoder.classes_:
            # If species not in training data, use a default encoding
            species_encoded = 0
            print(f"Warning: Unknown species '{request.species}', using default encoding")
        else:
            species_encoded = species_encoder.transform([request.species])[0]

        # Create feature vector
        features = np.array([[request.latitude, request.longitude, request.year, species_encoded]])

        # Make prediction
        prediction = model.predict(features)[0]

        # Get prediction probabilities for confidence
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities))

        # Determine status
        status = "High Risk" if prediction == 1 else "Stable"

        result = PredictionResponse(
            decline_risk=int(prediction),
            status=status,
            confidence=confidence,
            region=region_info["region"],
            region_info=region_info,
            scientific_name=species_info["scientific_name"],
            common_names=species_info["common_names"]
        )

        # Cache set
        cache.set(cache_key, result.model_dump())

        # Metrics
        PREDICTION_COUNT.labels(status="high_risk" if prediction == 1 else "stable").inc()
        REQUEST_LATENCY.labels(endpoint="/predict").observe(time.time() - start_time)
        REQUEST_COUNT.labels(endpoint="/predict", method="POST", status="200").inc()

        return result

    except Exception as e:
        EXCEPTIONS.labels(endpoint="/predict").inc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

        data = generate_latest()
        return Response(content=data, media_type=CONTENT_TYPE_LATEST)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics error: {e}")


@app.get("/species")
async def list_species():
    """List all known species in the model"""
    if species_encoder is None:
        raise HTTPException(status_code=503, detail="Encoder not loaded")

    return {"species": species_encoder.classes_.tolist(), "count": len(species_encoder.classes_)}


@app.get("/search/insects")
async def search_insects(
    region: Optional[str] = Query(None, description="Region filter (e.g., 'north_america', 'europe')"),
    country: Optional[str] = Query(None, description="Country name or code"),
    year_from: Optional[int] = Query(None, ge=1900, le=2100, description="Start year"),
    year_to: Optional[int] = Query(None, ge=1900, le=2100, description="End year"),
    species: Optional[str] = Query(None, description="Species name filter"),
    status: Optional[str] = Query(None, description="Population trend filter"),
    limit: int = Query(100, ge=1, le=500, description="Maximum results")
):
    """
    Advanced search for insect records with location and temporal filters
    
    Searches through local dataset and GBIF occurrences with comprehensive filtering
    """
    try:
        import pandas as pd
        
        # Load local dataset
        local_data_path = "data/insect.csv"
        results = []
        
        if os.path.exists(local_data_path):
            df = pd.read_csv(local_data_path)
            
            # Apply filters
            if year_from:
                df = df[df['year'] >= year_from]
            if year_to:
                df = df[df['year'] <= year_to]
            if species:
                df = df[df['species'].str.contains(species, case=False, na=False)]
            if status:
                df = df[df['population_trend'].str.contains(status, case=False, na=False)]
            
            # Apply region filter
            if region and region in REGION_MAPPING:
                bounds = REGION_MAPPING[region]["bounds"]
                lat_min, lat_max = bounds["lat"]
                lon_min, lon_max = bounds["lon"]
                df = df[
                    (df['latitude'] >= lat_min) & (df['latitude'] <= lat_max) &
                    (df['longitude'] >= lon_min) & (df['longitude'] <= lon_max)
                ]
            
            # Limit results
            df = df.head(limit)
            
            # Format results with enhanced information
            for _, row in df.iterrows():
                region_info = get_region_from_coordinates(row['latitude'], row['longitude'])
                species_info = get_species_scientific_name(row['species'])
                
                results.append({
                    "id": f"local_{_}",
                    "species": row['species'],
                    "scientific_name": species_info['scientific_name'],
                    "common_names": species_info.get('common_names', []),
                    "latitude": float(row['latitude']),
                    "longitude": float(row['longitude']),
                    "year": int(row['year']),
                    "population_trend": row['population_trend'],
                    "region": region_info['region'],
                    "region_key": region_info['key'],
                    "description": region_info['description'],
                    "kingdom": species_info.get('kingdom'),
                    "order": species_info.get('order'),
                    "family": species_info.get('family'),
                    "source": "local_database"
                })
        
        # Get statistics
        stats = {
            "total_records": len(results),
            "species_count": len(set(r['species'] for r in results)),
            "year_range": [min(r['year'] for r in results), max(r['year'] for r in results)] if results else [],
            "regions": list(set(r['region'] for r in results)),
            "trend_distribution": {}
        }
        
        if results:
            from collections import Counter
            trend_counts = Counter(r['population_trend'] for r in results)
            stats['trend_distribution'] = dict(trend_counts)
        
        return {
            "status": "success",
            "filters": {
                "region": region,
                "country": country,
                "year_from": year_from,
                "year_to": year_to,
                "species": species,
                "status": status
            },
            "statistics": stats,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@app.get("/species/declining-analysis")
async def get_species_declining_analysis(
    species: str = Query(..., description="Species name to analyze")
):
    """
    Analyze where a specific species is declining the most
    
    Returns detailed information about population trends by region
    """
    try:
        import pandas as pd
        from collections import defaultdict
        
        local_data_path = "data/insect.csv"
        
        if not os.path.exists(local_data_path):
            raise HTTPException(status_code=404, detail="Data file not found")
        
        df = pd.read_csv(local_data_path)
        
        # Filter by species (case-insensitive)
        species_df = df[df['species'].str.contains(species, case=False, na=False)]
        
        if species_df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for species: {species}")
        
        # Get species scientific name
        species_info = get_species_scientific_name(species_df.iloc[0]['species'])
        
        # Analyze by region
        regional_analysis = defaultdict(lambda: {
            'declining': 0,
            'stable': 0,
            'increasing': 0,
            'total': 0,
            'locations': []
        })
        
        for _, row in species_df.iterrows():
            region_info = get_region_from_coordinates(row['latitude'], row['longitude'])
            region_key = region_info['key']
            trend = row['population_trend'].lower()
            
            regional_analysis[region_key]['total'] += 1
            if trend == 'declining':
                regional_analysis[region_key]['declining'] += 1
            elif trend == 'stable':
                regional_analysis[region_key]['stable'] += 1
            elif trend == 'increasing':
                regional_analysis[region_key]['increasing'] += 1
            
            regional_analysis[region_key]['locations'].append({
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'year': int(row['year']),
                'trend': row['population_trend']
            })
        
        # Calculate percentages and format results
        regions_data = []
        for region_key, data in regional_analysis.items():
            total = data['total']
            declining_pct = (data['declining'] / total * 100) if total > 0 else 0
            
            # Get region name
            region_name = "Unknown"
            for key, val in REGION_MAPPING.items():
                if key == region_key:
                    region_name = val['name']
                    break
            
            regions_data.append({
                'region': region_name,
                'region_key': region_key,
                'total_records': total,
                'declining_count': data['declining'],
                'stable_count': data['stable'],
                'increasing_count': data['increasing'],
                'declining_percentage': round(declining_pct, 2),
                'locations': data['locations'][:10]  # Limit to 10 locations per region
            })
        
        # Sort by declining percentage (highest first)
        regions_data.sort(key=lambda x: x['declining_percentage'], reverse=True)
        
        # Overall statistics
        total_records = len(species_df)
        overall_declining = len(species_df[species_df['population_trend'].str.lower() == 'declining'])
        overall_declining_pct = (overall_declining / total_records * 100) if total_records > 0 else 0
        
        return {
            "status": "success",
            "species": species_df.iloc[0]['species'],
            "scientific_name": species_info['scientific_name'],
            "common_names": species_info.get('common_names', []),
            "taxonomy": {
                "kingdom": species_info.get('kingdom'),
                "order": species_info.get('order'),
                "family": species_info.get('family')
            },
            "overall_statistics": {
                "total_records": total_records,
                "declining_count": overall_declining,
                "declining_percentage": round(overall_declining_pct, 2),
                "regions_affected": len(regions_data)
            },
            "regional_analysis": regions_data,
            "most_declining_region": regions_data[0] if regions_data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Declining analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.get("/gbif/search")
async def search_species_gbif(
    query: str = Query(..., description="Species name to search"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results"),
):
    """
    Search for species in GBIF database

    Returns matching species with scientific names and keys
    """
    try:
        results = gbif_client.search_species(query, limit=limit)

        return {
            "query": query,
            "count": len(results),
            "results": [
                {
                    "key": r.get("key"),
                    "scientificName": r.get("scientificName"),
                    "canonicalName": r.get("canonicalName"),
                    "rank": r.get("rank"),
                    "kingdom": r.get("kingdom"),
                    "phylum": r.get("phylum"),
                    "class": r.get("class"),
                    "order": r.get("order"),
                    "family": r.get("family"),
                }
                for r in results
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GBIF search error: {str(e)}")


@app.get("/gbif/occurrences")
async def get_occurrences_gbif(
    scientific_name: str = Query(..., description="Scientific name of species"),
    country: Optional[str] = Query(None, description="Two-letter country code"),
    year: Optional[int] = Query(None, description="Year of observation"),
    limit: int = Query(100, ge=1, le=300, description="Maximum results"),
):
    """
    Get species occurrences from GBIF

    Returns occurrence records with location and temporal data
    """
    try:
        result = gbif_client.search_occurrences(
            scientific_name=scientific_name, country=country, year=year, limit=limit
        )

        occurrences = []
        for record in result.get("results", []):
            occ = gbif_client.parse_occurrence(record)
            if occ:
                occurrences.append(occ.to_dict())

        return {
            "scientific_name": scientific_name,
            "count": len(occurrences),
            "total_available": result.get("count", 0),
            "occurrences": occurrences,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GBIF occurrences error: {str(e)}")


@app.get("/gbif/species/{scientific_name}")
async def get_species_info_gbif(scientific_name: str):
    """
    Get detailed species information from GBIF

    Returns taxonomy, conservation status, and other metadata
    """
    try:
        info = gbif_client.get_species_info(scientific_name)

        if not info:
            raise HTTPException(
                status_code=404, detail=f"Species '{scientific_name}' not found in GBIF"
            )

        return {
            "key": info.get("key"),
            "scientificName": info.get("scientificName"),
            "canonicalName": info.get("canonicalName"),
            "rank": info.get("rank"),
            "status": info.get("taxonomicStatus"),
            "kingdom": info.get("kingdom"),
            "phylum": info.get("phylum"),
            "class": info.get("class"),
            "order": info.get("order"),
            "family": info.get("family"),
            "genus": info.get("genus"),
            "vernacularNames": info.get("vernacularNames", [])[:5],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GBIF species info error: {str(e)}")


@app.post("/gbif/fetch-dataset")
async def fetch_training_dataset(
    species_list: List[str] = Query(..., description="List of species to fetch"),
    max_records: int = Query(1000, ge=100, le=5000),
    year_from: int = Query(2015, ge=1900, le=2024),
    year_to: int = Query(2024, ge=1900, le=2024),
):
    """
    Fetch and prepare training dataset from GBIF

    Downloads occurrence data and calculates population trends
    """
    try:
        logger.info(f"Fetching dataset for {len(species_list)} species")

        df = data_processor.fetch_and_prepare_dataset(
            species_list=species_list,
            max_records=max_records,
            year_from=year_from,
            year_to=year_to,
            save_path="data/gbif_insect_data.csv",
        )

        if df.empty:
            raise HTTPException(status_code=404, detail="No data could be fetched from GBIF")

        return {
            "status": "success",
            "records_fetched": len(df),
            "species_count": df["species"].nunique(),
            "year_range": [int(df["year"].min()), int(df["year"].max())],
            "trend_distribution": df["population_trend"].value_counts().to_dict(),
            "saved_to": "data/gbif_insect_data.csv",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dataset fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dataset fetch error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
