# EcoPredict - Quick Start Guide

## 🚀 Fastest Way to Get Started

### Option 1: Docker (Recommended)
```powershell
# Start everything with one command
.\docker-start.ps1

# Or manually
docker-compose up -d --build
```

Access: http://localhost:8080

### Option 2: Local Development
```powershell
# Terminal 1: Start Backend
cd src
pip install -r ../requirements.txt
python train_model.py
uvicorn api:app --reload

# Terminal 2: Start Frontend
cd react-frontend
npm install
npm start
```

Access: http://localhost:3000

---

## 🔐 Authentication Setup

The app now includes full authentication:

1. **Sign Up**: Create a new account at `/signup`
2. **Sign In**: Login at `/login`
3. **Dashboard**: Access protected features

**First User Setup:**
- Go to http://localhost:8080/signup
- Create an account
- You'll be automatically logged in

---

## 🐳 Docker Commands

```powershell
# Start services
.\docker-start.ps1                  # Easy way
docker-compose up -d --build        # Manual way

# View logs
docker-compose logs -f
docker-compose logs -f api          # Just API logs

# Stop services
.\docker-stop.ps1                   # Easy way
docker-compose down                 # Manual way

# Restart a service
docker-compose restart api

# Check status
docker-compose ps
```

---

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Sign in
- `GET /auth/me` - Get profile (requires token)

### Predictions
- `POST /predict` - Predict biodiversity risk
- `GET /species` - List known species
- `GET /search/insects` - Search insect records

### Monitoring
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /docs` - Interactive API docs

---

## 🌐 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 8080 | http://localhost:8080 |
| API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| Grafana | 3000 | http://localhost:3000 |
| Prometheus | 9090 | http://localhost:9090 |

---

## 🔧 Troubleshooting

### "Can't sign in"
✅ **FIXED!** Authentication is now fully implemented.

### Models not found
```powershell
python src/train_model.py
```

### Port already in use
```powershell
# Find process
netstat -ano | findstr :8000

# Kill it
taskkill /PID <PID> /F
```

### Docker not starting
- Make sure Docker Desktop is running
- Check logs: `docker-compose logs`

### Can't connect to API
- Check API is running: `curl http://localhost:8000/health`
- Check logs: `docker-compose logs api`

---

## 📁 Project Structure

```
├── src/                    # Backend Python code
│   ├── api.py             # FastAPI app with auth
│   ├── train_model.py     # ML training
│   └── ...
├── react-frontend/         # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── login.js   # Login page
│   │   │   ├── signup.js  # Signup page
│   │   │   └── ...
│   └── ...
├── data/                   # Data files
│   ├── insect.csv         # Training data
│   └── users.json         # User accounts (auto-created)
├── models/                 # Trained models
├── docker-compose.yml      # Docker config
└── .env                    # Environment variables
```

---

## 🔒 Security Notes

1. **Change SECRET_KEY** in `.env` for production
2. **Use strong passwords** for accounts
3. **Backup `data/users.json`** regularly
4. **Enable SSL** for production deployment

---

## 📚 Documentation

- Full Docker Guide: See [DOCKER_README.md](DOCKER_README.md)
- API Documentation: http://localhost:8000/docs
- Architecture: See [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Check health: `docker-compose ps`
3. Read docs: http://localhost:8000/docs
4. Check [DOCKER_README.md](DOCKER_README.md)

---

## ✅ Quick Checklist

- [ ] Docker Desktop installed and running
- [ ] Clone repository
- [ ] Run `.\docker-start.ps1`
- [ ] Access http://localhost:8080
- [ ] Create account at `/signup`
- [ ] Start predicting! 🌱
