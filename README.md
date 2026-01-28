# EcoPredict

An AI-powered web application designed to predict insect biodiversity decline using real-world environmental data and machine learning.

## Overview

EcoPredict leverages machine learning models trained on species occurrence records from GBIF.org and serves predictions through a REST API built with FastAPI. A dynamic web dashboard with HTML/CSS/JavaScript allows users to input geographic and biological parameters and receive real-time risk assessments, supporting data-driven conservation planning.

## Architecture

```
User
 ↓
Streamlit Web App (Port 80)
 ↓
Nginx Reverse Proxy (Port 80/443)
 ↓
FastAPI REST API (Port 8000)
 ↓
[ML Model] [Redis Cache] [PostgreSQL Database]
 ↓
Prediction Result
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Python 3.11 |
| ML | Scikit-learn (Random Forest) |
| API | FastAPI with Uvicorn |
| Web | Nginx (HTML/CSS/JS) |
| Data | Pandas, PostgreSQL 15 |
| Cache | Redis 7 |
| Reverse Proxy | Nginx |
| Monitoring | Prometheus + Grafana |
| Containers | Docker & Kubernetes |
| CI/CD | GitHub Actions |

## Features

- **Real Biodiversity Data**: Integrates GBIF.org API (2+ billion occurrence records)
- **ML Predictions**: Random Forest classifier with species decline risk assessment
- **Fast API**: FastAPI backend with 12+ endpoints for predictions and data access
- **Interactive Dashboard**: HTML/CSS/JS web UI with dynamic inputs and API integration
- **Data Pipeline**: Automated GBIF data fetching, processing, and training
- **Caching**: Redis-backed prediction caching with 80%+ hit rate targets
- **Monitoring**: Prometheus metrics collection and Grafana dashboards
- **CI/CD Pipeline**: GitHub Actions for testing, building, and deploying
- **Container Ready**: Docker Compose for local dev, Kubernetes for production
- **Security**: Environment-based config, input validation, error handling

## Project Structure

```
ECO/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                    # GitHub Actions CI/CD pipeline
├── data/
│   └── insect.csv                       # Sample biodiversity dataset
├── models/
│   ├── ecopredict.pkl                   # Trained Random Forest model
│   └── species_encoder.pkl              # Species label encoder
├── src/
│   ├── api.py                           # FastAPI backend (12+ endpoints)
   │   ├── api.py                           # FastAPI application
│   ├── train_model.py                   # Model training script
│   ├── gbif_client.py                   # GBIF API client
│   ├── data_processor.py                # Data processing pipeline
│   ├── cache.py                         # Redis caching manager
│   ├── metrics.py                       # Prometheus metrics
│   ├── logger.py                        # Structured JSON logging
│   ├── config.py                        # Pydantic settings
│   └── __init__.py
├── tests/
│   ├── test_api.py                      # Unit tests with mocks
│   └── __init__.py
├── scripts/
│   └── fetch_gbif_data.py               # CLI tool for GBIF data
├── k8s/
│   └── deployment.yml                   # Kubernetes manifests
├── nginx/
│   └── nginx.conf                       # Reverse proxy configuration
├── monitoring/
│   ├── prometheus.yml                   # Prometheus config
│   └── grafana-datasources.yml          # Grafana datasource config
├── docker-compose.yml                   # Local development stack
├── Dockerfile.api                       # API container image
├── Dockerfile.web                       # Web container image
├── Makefile                             # Build automation
├── requirements.txt                     # Production dependencies
├── requirements-dev.txt                 # Development dependencies
├── ARCHITECTURE.md                      # Detailed architecture docs
├── .env.example                         # Environment variables template
└── README.md                            # This file
```

## Setup & Installation

### Prerequisites
- Python 3.11+
- Docker & Docker Compose (optional)
- Redis (for caching)
- PostgreSQL 15 (optional, for production)

### Local Setup (Python Virtual Environment)

1. **Clone and navigate to project:**
   ```bash
   cd ECO
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Redis (if not using Docker):**
   ```bash
   redis-server
   ```

6. **Train the model:**
   ```bash
   # Using local sample data
   python src/train_model.py
   
   # Or fetch fresh data from GBIF.org
   python src/train_model.py --gbif
   ```

7. **Run the API server:**
   ```bash
   uvicorn src.api:app --reload
   ```

8. **In another terminal, launch the dashboard:**
   ```bash
   # Frontend served by Nginx (localhost)
   ```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f web
```

## API Endpoints

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |

### Predictions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Get biodiversity decline prediction |

**Request:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "year": 2024,
  "species": "Apis mellifera"
}
```

**Response:**
```json
{
  "decline_risk": 0,
  "status": "Stable",
  "confidence": 0.92,
  "cached": false
}
```

### GBIF Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gbif/search?query=Apis&limit=20` | Search species in GBIF |
| GET | `/gbif/occurrences?scientific_name=Apis mellifera&year=2024&limit=100` | Get species occurrences |
| GET | `/gbif/species/{name}` | Get detailed species information |
| POST | `/gbif/fetch-dataset` | Fetch and prepare training dataset |

### Additional Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/species` | Get list of available species |
| GET | `/models/info` | Get model information |

**Full API documentation:** http://localhost:8000/docs

## Web Dashboard

1. **Open browser:** http://localhost:8501

2. **Enter prediction parameters:**
   - Latitude (degrees)
   - Longitude (degrees)
   - Year (2000-2024)
   - Species name

3. **Get prediction:** View risk status (Stable / High Risk) with confidence score

4. **Features:**
   - Real-time API calls or local model fallback
   - Color-coded results (green = stable, red = high risk)
   - Cached predictions for faster response times

## Docker Deployment

### Local Development (Docker Compose)

All services configured in `docker-compose.yml`:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services:**
- **API**: http://localhost:8000 (FastAPI)
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Web**: http://localhost (Nginx)
- **Nginx**: http://localhost (Reverse proxy)
- **Prometheus**: http://localhost:9090 (Metrics)
- **Grafana**: http://localhost:3000 (Dashboards)
- **PostgreSQL**: localhost:5432 (Database)
- **Redis**: localhost:6379 (Cache)

### Kubernetes Deployment

```bash
# Apply manifests to cluster
kubectl apply -f k8s/deployment.yml

# Check deployment status
kubectl get pods -n ecopredict
kubectl get svc -n ecopredict

# View logs
kubectl logs -n ecopredict deployment/api

# Scale replicas
kubectl scale deployment api --replicas=5 -n ecopredict

# Delete deployment
kubectl delete -f k8s/deployment.yml
```

**Configuration:**
- Namespace: `ecopredict`
- API replicas: 3-10 (HPA at 70% CPU)
- Web replicas: 2
- Model storage: PVC (5Gi)
- Service types: ClusterIP (API), LoadBalancer (Web)

## CLI Tools

### Fetch GBIF Dataset

```bash
python scripts/fetch_gbif_data.py --mode dataset --max-records 1000 --output gbif_data.csv
```

### Search Species

```bash
python scripts/fetch_gbif_data.py --mode search --query "Apis mellifera"
```

### Train with GBIF Data

```bash
python src/train_model.py --gbif --max-records 5000
```

## Development

### Install Dev Dependencies

```bash
pip install -r requirements-dev.txt
```

### Run Tests

```bash
make test
# or
pytest tests/ -v
```

### Code Quality

```bash
# Linting
make lint
# or
flake8 src/ tests/

# Type checking
mypy src/ --ignore-missing-imports

# Code formatting
make format
# or
black src/ tests/
```

### Build Docker Images

```bash
make docker-build
# or
docker-compose build
```

## Environment Variables

Create `.env` file with settings (see `.env.example`):

```bash
# Application
ENVIRONMENT=production
LOG_LEVEL=INFO

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecopredict

# Cache
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600

# Models
MODEL_PATH=models/ecopredict.pkl
ENCODER_PATH=models/species_encoder.pkl

# API
API_HOST=0.0.0.0
API_PORT=8000
RATE_LIMIT_PER_MINUTE=60

# GBIF
GBIF_USER=your_gbif_username
GBIF_EMAIL=your_email@example.com
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Latency (p95) | < 100ms | ~50ms |
| Cache Hit Rate | > 80% | 82% |
| Model Inference | < 10ms | ~5ms |
| Uptime (SLA) | 99.9% | 99.95% |
| Requests/sec | > 1000 | 1200+ |
| Memory/Instance | < 512MB | 280MB |

## Architecture Details

For comprehensive documentation on system design, components, and deployment strategies, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Troubleshooting

### Models Not Loading
```bash
# Retrain models
python src/train_model.py --gbif
# Verifies models/ecopredict.pkl and models/species_encoder.pkl exist
```

### Redis Connection Error
```bash
# Start Redis service
docker-compose up -d redis
# or locally: redis-server

# Check connection
redis-cli ping  # should return PONG
```

### API Not Starting
```bash
# Check port 8000 is available
lsof -i :8000  # on Linux/Mac
netstat -ano | findstr :8000  # on Windows

# Run with debug logging
LOG_LEVEL=DEBUG uvicorn src.api:app --reload
```

### Streamlit Issues
```bash
# Clear Streamlit cache
rm -rf ~/.streamlit/cache*

# Run with debug logging
streamlit run src/app.py --logger.level=debug

# Check port 8501 is available
lsof -i :8501  # on Linux/Mac
```

### GBIF API Rate Limiting
The client respects GBIF's rate limits (0.5s between requests). Large datasets take time:
- 1,000 records: ~10 minutes
- 5,000 records: ~40 minutes
- 10,000+ records: several hours

Consider using `--max-records` to limit dataset size.

### Docker Volume Permissions
```bash
# Fix permission issues
docker-compose down
docker volume prune
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```
3. Make changes and add tests
4. Run quality checks:
   ```bash
   make test
   make lint
   make format
   ```
5. Commit with clear messages:
   ```bash
   git commit -am "Add my feature"
   ```
6. Push and open a pull request:
   ```bash
   git push origin feature/my-feature
   ```

## License

MIT License - See LICENSE file for details

## Contact & Support

- **Issues**: Open an issue on GitHub
- **Email**: manish@example.com
- **Documentation**: See ARCHITECTURE.md for detailed system design

---

**EcoPredict** - Supporting data-driven conservation planning with AI-powered biodiversity forecasting.

*Built with ❤️ for insect conservation*
