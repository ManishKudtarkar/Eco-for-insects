"""
EcoPredict FastAPI Backend
REST API for serving biodiversity decline predictions
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
import pickle
import numpy as np
from typing import Optional, List
import os
from src.gbif_client import gbif_client
from src.data_processor import data_processor
from src.logger import logger


# Initialize FastAPI app
app = FastAPI(
    title="EcoPredict API",
    description="AI-powered API for predicting insect biodiversity decline",
    version="1.0.0"
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
                "species": "Apis mellifera"
            }
        }


# Response model
class PredictionResponse(BaseModel):
    decline_risk: int = Field(..., description="Decline risk (0=Stable, 1=High Risk)")
    status: str = Field(..., description="Human-readable status")
    confidence: Optional[float] = Field(None, description="Prediction confidence")


# Global variables for model and encoder
model = None
species_encoder = None


def load_models():
    """Load trained model and encoders"""
    global model, species_encoder
    
    model_path = 'models/ecopredict.pkl'
    encoder_path = 'models/species_encoder.pkl'
    
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
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    with open(encoder_path, 'rb') as f:
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
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_loaded = model is not None
    encoder_loaded = species_encoder is not None
    
    return {
        "status": "healthy" if (model_loaded and encoder_loaded) else "degraded",
        "model_loaded": model_loaded,
        "encoder_loaded": encoder_loaded
    }


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
            detail="Models not loaded. Please train the model first using 'python src/train_model.py'"
        )
    
    try:
        # Encode species
        if request.species not in species_encoder.classes_:
            # If species not in training data, use a default encoding
            # In production, you might want to handle this differently
            species_encoded = 0
            print(f"Warning: Unknown species '{request.species}', using default encoding")
        else:
            species_encoded = species_encoder.transform([request.species])[0]
        
        # Create feature vector
        features = np.array([[
            request.latitude,
            request.longitude,
            request.year,
            species_encoded
        ]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Get prediction probabilities for confidence
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities))
        
        # Determine status
        status = "High Risk" if prediction == 1 else "Stable"
        
        return PredictionResponse(
            decline_risk=int(prediction),
            status=status,
            confidence=confidence
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


@app.get("/species")
async def list_species():
    """List all known species in the model"""
    if species_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Encoder not loaded"
        )
    
    return {
        "species": species_encoder.classes_.tolist(),
        "count": len(species_encoder.classes_)
    }


@app.get("/gbif/search")
async def search_species_gbif(
    query: str = Query(..., description="Species name to search"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results")
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
                    "family": r.get("family")
                }
                for r in results
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"GBIF search error: {str(e)}"
        )


@app.get("/gbif/occurrences")
async def get_occurrences_gbif(
    scientific_name: str = Query(..., description="Scientific name of species"),
    country: Optional[str] = Query(None, description="Two-letter country code"),
    year: Optional[int] = Query(None, description="Year of observation"),
    limit: int = Query(100, ge=1, le=300, description="Maximum results")
):
    """
    Get species occurrences from GBIF
    
    Returns occurrence records with location and temporal data
    """
    try:
        result = gbif_client.search_occurrences(
            scientific_name=scientific_name,
            country=country,
            year=year,
            limit=limit
        )
        
        occurrences = []
        for record in result.get('results', []):
            occ = gbif_client.parse_occurrence(record)
            if occ:
                occurrences.append(occ.to_dict())
        
        return {
            "scientific_name": scientific_name,
            "count": len(occurrences),
            "total_available": result.get('count', 0),
            "occurrences": occurrences
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"GBIF occurrences error: {str(e)}"
        )


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
                status_code=404,
                detail=f"Species '{scientific_name}' not found in GBIF"
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
            "vernacularNames": info.get("vernacularNames", [])[:5]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"GBIF species info error: {str(e)}"
        )


@app.post("/gbif/fetch-dataset")
async def fetch_training_dataset(
    species_list: List[str] = Query(..., description="List of species to fetch"),
    max_records: int = Query(1000, ge=100, le=5000),
    year_from: int = Query(2015, ge=1900, le=2024),
    year_to: int = Query(2024, ge=1900, le=2024)
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
            save_path="data/gbif_insect_data.csv"
        )
        
        if df.empty:
            raise HTTPException(
                status_code=404,
                detail="No data could be fetched from GBIF"
            )
        
        return {
            "status": "success",
            "records_fetched": len(df),
            "species_count": df['species'].nunique(),
            "year_range": [int(df['year'].min()), int(df['year'].max())],
            "trend_distribution": df['population_trend'].value_counts().to_dict(),
            "saved_to": "data/gbif_insect_data.csv"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dataset fetch error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Dataset fetch error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
