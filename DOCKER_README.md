# EcoPredict Docker Setup

## Quick Start

### 1. Install Dependencies (First Time Only)
```powershell
# Install Python dependencies for local development
pip install -r requirements.txt

# Install React dependencies
cd react-frontend
npm install
cd ..
```

### 2. Train the Model (Required Before First Run)
```powershell
# Make sure you have training data
python src/train_model.py
```

### 3. Build and Run with Docker Compose

#### Production Mode
```powershell
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

#### Development Mode (with hot reload)
```powershell
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d --build

# View API logs
docker-compose logs -f api

# View React logs
docker-compose logs -f react-web
```

## Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| React Frontend | 8080 | Main web application |
| FastAPI Backend | 8000 | REST API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| Prometheus | 9090 | Metrics |
| Grafana | 3000 | Monitoring Dashboard |
| Legacy Frontend | 8081 | Simple HTML frontend |
| Nginx Proxy | 80/443 | Reverse proxy |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```powershell
# Copy environment file
Copy-Item .env.example .env

# Edit .env file with your settings
notepad .env
```

**Important:** Change `SECRET_KEY` in production!

## Authentication

The application now includes JWT-based authentication:

- **Register:** POST `/auth/register`
- **Login:** POST `/auth/login`
- **Get Profile:** GET `/auth/me` (requires token)

User data is stored in `data/users.json`.

## Docker Commands

### Build Services
```powershell
# Build all services
docker-compose build

# Build specific service
docker-compose build api
docker-compose build react-web
```

### Manage Services
```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a service
docker-compose restart api

# View service status
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f react-web
```

### Database Management
```powershell
# Access PostgreSQL
docker-compose exec postgres psql -U ecopredict_user -d ecopredict

# Backup database
docker-compose exec postgres pg_dump -U ecopredict_user ecopredict > backup.sql

# Restore database
docker-compose exec -T postgres psql -U ecopredict_user ecopredict < backup.sql
```

### Redis Management
```powershell
# Access Redis CLI
docker-compose exec redis redis-cli

# Clear cache
docker-compose exec redis redis-cli FLUSHALL
```

### Cleanup
```powershell
# Stop and remove containers, networks
docker-compose down

# Remove volumes (WARNING: deletes data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup
docker-compose down -v --rmi all --remove-orphans
```

## Accessing Services

### Frontend
- React App: http://localhost:8080
- Legacy App: http://localhost:8081

### Backend
- API Docs: http://localhost:8000/docs
- API Health: http://localhost:8000/health
- Metrics: http://localhost:8000/metrics

### Monitoring
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

## Troubleshooting

### API Won't Start
```powershell
# Check if models are trained
docker-compose exec api ls -la /app/models

# Train models inside container
docker-compose exec api python src/train_model.py

# Check logs
docker-compose logs api
```

### Database Connection Issues
```powershell
# Check database health
docker-compose exec postgres pg_isready -U ecopredict_user

# Restart database
docker-compose restart postgres
```

### Frontend Can't Connect to API
```powershell
# Check nginx config
docker-compose exec react-web cat /etc/nginx/conf.d/default.conf

# Check API is accessible
curl http://localhost:8000/health
```

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

## Production Deployment

### 1. Update Environment Variables
```powershell
# Generate secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Update .env file with production values
```

### 2. Configure SSL (Optional)
```powershell
# Place SSL certificates in nginx/ssl/
# - cert.pem
# - key.pem

# Uncomment SSL configuration in nginx/nginx.conf
```

### 3. Deploy
```powershell
# Pull latest changes
git pull

# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

## Development Workflow

### Backend Development
```powershell
# Start services with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up api

# Code changes in src/ will auto-reload
```

### Frontend Development
```powershell
# Option 1: Docker with hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up react-web

# Option 2: Local development server
cd react-frontend
npm start
```

## Health Checks

All services include health checks:

```powershell
# Check all service health
docker-compose ps

# Individual service health
curl http://localhost:8000/health  # API
curl http://localhost:8080/health  # React Frontend
docker-compose exec redis redis-cli ping  # Redis
docker-compose exec postgres pg_isready -U ecopredict_user  # PostgreSQL
```

## Data Persistence

Data is persisted in Docker volumes:

- `postgres_data` - Database
- `redis_data` - Cache
- `prometheus_data` - Metrics
- `grafana_data` - Dashboards

Local directories mounted:
- `./models` - ML models
- `./logs` - Application logs
- `./data` - User data and CSV files

## Security Notes

1. **Change default passwords** in `.env` file
2. **Use strong SECRET_KEY** for JWT tokens
3. **Enable SSL** for production (https)
4. **Restrict CORS origins** in production
5. **Regular backups** of database and user data
6. **Keep Docker images updated**

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review health checks: `docker-compose ps`
3. Check documentation: http://localhost:8000/docs
