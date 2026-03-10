# Render Deployment Guide for EcoPredict

This guide explains how to deploy the EcoPredict Insect Biodiversity Tracker to Render.com.

## 🚀 Quick Deploy (Recommended)

### Option 1: Deploy with Blueprint (render.yaml)

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com) and sign up/log in
   - Click **"New"** → **"Blueprint"**
   - Connect your GitHub repository
   - Select the repository containing this project
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables**
   - Render will use the envVars defined in `render.yaml`
   - The `SECRET_KEY` will be auto-generated
   - Update `CORS_ORIGINS` after deployment with your frontend URL

4. **Deploy**
   - Click "Apply" to create both services
   - Wait 5-10 minutes for initial deployment

5. **Update API URL in Frontend**
   After deployment, update the API URL in your React app:
   ```bash
   # Get your API URL from Render dashboard (e.g., https://ecopredict-api.onrender.com)
   # Update react-frontend/src/pages/search.js:
   # Change: http://localhost:8000
   # To: https://your-api-url.onrender.com
   ```

6. **Redeploy Frontend**
   - Commit the API URL change
   - Push to trigger auto-deployment

---

## 📋 Manual Deployment (Alternative)

### Step 1: Deploy API (Backend)

1. **Create Web Service**
   - Go to Render Dashboard → **"New"** → **"Web Service"**
   - Connect GitHub repository
   - Configure:
     - **Name:** `ecopredict-api`
     - **Region:** Oregon (or nearest)
     - **Branch:** `main`
     - **Runtime:** Docker
     - **Dockerfile Path:** `./Dockerfile.api`
     - **Docker Context:** `.` (root directory)
     - **Plan:** Free (or Starter for production)

2. **Set Environment Variables**
   ```
   PORT = 8000
   ENVIRONMENT = production
   SECRET_KEY = [Generate Random String - Click "Generate"]
   CORS_ORIGINS = https://your-frontend-url.onrender.com
   LOG_LEVEL = INFO
   MAX_WORKERS = 1
   PYTHONUNBUFFERED = 1
   ```

3. **Add Persistent Disk (Optional)**
   - Name: `ecopredict-data`
   - Mount Path: `/app/data`
   - Size: 1GB (free tier)
   - This keeps your data/models across deployments

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~5-7 minutes)

5. **Verify API**
   - Open: `https://your-api-url.onrender.com/health`
   - Should return: `{"status": "healthy"}`

### Step 2: Deploy Frontend (React)

1. **Create Web Service**
   - Render Dashboard → **"New"** → **"Web Service"**
   - Connect same GitHub repository
   - Configure:
     - **Name:** `ecopredict-frontend`
     - **Region:** Oregon (same as API)
     - **Branch:** `main`
     - **Runtime:** Docker
     - **Dockerfile Path:** `./Dockerfile`
     - **Docker Context:** `./react-frontend`
     - **Plan:** Free

2. **Set Environment Variables**
   ```
   REACT_APP_API_URL = https://your-api-url.onrender.com
   ```

3. **Build Filters (Optional)**
   Under "Advanced" → "Build Filters":
   - Paths: `react-frontend/**`
   - This prevents frontend rebuilds when you only change backend code

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~3-5 minutes)

### Step 3: Update CORS

1. Go back to API service settings
2. Update `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS = https://your-frontend-url.onrender.com
   ```
3. Save changes (triggers redeploy)

---

## 🔧 Post-Deployment Configuration

### Update Frontend API Calls

After getting your API URL, update these files:

**react-frontend/src/pages/search.js** (2 locations):
```javascript
// Line ~77 and ~116
// Before:
const response = await fetch(`http://localhost:8000/search/insects?...`);

// After:
const response = await fetch(`https://your-api-url.onrender.com/search/insects?...`);
```

Commit and push changes to trigger auto-deployment.

---

## 💰 Cost Breakdown

### Free Tier (Both Services)
- **Cost:** $0/month
- **Limitations:**
  - Services spin down after 15 minutes of inactivity
  - 750 hours/month (enough for ~1 service 24/7)
  - Cold starts: 30-60 seconds
  - No custom domains
  - Build: 500 build minutes/month

### Starter Plan ($7/month per service = $14/month)
- Services stay running 24/7
- Faster builds and deployments
- Custom domains
- SSL included
- 512MB RAM

### Standard Plan ($25/month per service)
- More resources (2GB RAM)
- Better performance
- Suitable for production

---

## 🔍 Monitoring & Troubleshooting

### Check Logs
1. Render Dashboard → Select Service
2. Click "Logs" tab
3. Filter by error level

### Health Checks
- API: `https://your-api.onrender.com/health`
- Frontend: `https://your-frontend.onrender.com` (should load homepage)

### Common Issues

**Issue 1: API Returns 500 Error**
- Check logs for Python errors
- Verify `data/insect.csv` exists in deployment
- Check environment variables

**Issue 2: CORS Errors in Browser**
- Update `CORS_ORIGINS` in API environment variables
- Must match exact frontend URL (including https://)
- Save and wait for redeploy

**Issue 3: Frontend Shows "Cannot connect to API"**
- Verify API is deployed and healthy
- Check `REACT_APP_API_URL` environment variable
- Update hardcoded URLs in search.js

**Issue 4: Slow Response Times (Free Tier)**
- Cold start: Services spin down after 15 minutes
- First request after sleep takes 30-60 seconds
- Upgrade to Starter plan for 24/7 uptime

**Issue 5: Build Fails**
- Check Render logs for specific error
- Common: Dockerfile path incorrect
- Verify Docker context is set correctly

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push
Render automatically rebuilds and deploys when you push to `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Wait 3-5 minutes for auto-deployment
```

### Disable Auto-Deploy
- Go to Service Settings
- Toggle off "Auto-Deploy"
- Manually deploy from dashboard

---

## 📊 Database Upgrade (Optional)

### Switch from CSV to PostgreSQL

1. **Add PostgreSQL in render.yaml** (already included, uncomment)
   - Free tier: 1GB storage, 90-day expiration
   - Paid tier: Starting at $7/month

2. **Update API Code**
   - Modify `src/data_processor.py` to use SQLAlchemy
   - Update `src/api.py` database queries

3. **Migration Script**
   Create `scripts/csv_to_postgres.py`:
   ```python
   import pandas as pd
   from sqlalchemy import create_engine
   
   df = pd.read_csv('data/insect.csv')
   engine = create_engine(os.getenv('DATABASE_URL'))
   df.to_sql('insects', engine, if_exists='replace', index=False)
   ```

4. **Add environment variable** to API service:
   ```
   DATABASE_URL = [Auto-populated by Render]
   ```

---

## 🛡️ Security Best Practices

1. **Never commit secrets**
   - Use environment variables
   - Keep `.env` in `.gitignore`

2. **Update CORS properly**
   - Don't use `*` in production
   - Specify exact frontend URL

3. **Rotate SECRET_KEY**
   - Regenerate periodically
   - Use Render's generate function

4. **Enable HTTPS only**
   - Render provides automatic SSL
   - Update all URLs to use `https://`

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Project Issues:** GitHub Issues tab

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] API service deployed
- [ ] Frontend service deployed
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] API URL updated in frontend code
- [ ] Health checks passing
- [ ] Search functionality tested
- [ ] Declining analysis working
- [ ] Error monitoring enabled

---

**Ready to deploy!** Choose either the Blueprint method (fastest) or Manual deployment (more control).
