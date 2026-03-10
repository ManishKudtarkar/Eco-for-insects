# 🚀 Quick Deploy Reference Card

## One-Command Deploy (PowerShell)
```powershell
.\deploy-to-render.ps1
```

## One-Command Deploy (Bash/Linux/Mac)
```bash
chmod +x deploy-to-render.sh
./deploy-to-render.sh
```

---

## 📝 Manual Quick Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render
- Go to: **https://render.com**
- Click: **New** → **Blueprint**
- Select: Your GitHub repo
- Render auto-detects `render.yaml`
- Click: **Apply**

### 3. After Deployment
Get your API URL from Render dashboard, then update:

**File:** `react-frontend/src/pages/search.js`

**Lines to change:** ~77 and ~116
```javascript
// Before:
http://localhost:8000

// After:
https://your-api-url.onrender.com
```

**Commit & Push:**
```bash
git add react-frontend/src/pages/search.js
git commit -m "Update API URL for production"
git push origin main
```

### 4. Update CORS
In Render API service settings:
- Find: `CORS_ORIGINS` environment variable
- Change to: `https://your-frontend-url.onrender.com`
- Save (auto-redeploys)

---

## 🔗 Important URLs After Deploy

| Service | URL |
|---------|-----|
| **Frontend** | https://ecopredict-frontend.onrender.com |
| **API** | https://ecopredict-api.onrender.com |
| **API Health** | https://ecopredict-api.onrender.com/health |
| **API Docs** | https://ecopredict-api.onrender.com/docs |

*(Replace with your actual Render URLs)*

---

## 🐛 Quick Troubleshooting

**Frontend can't connect to API:**
```bash
# Check the API URL in search.js
grep -r "localhost:8000" react-frontend/src/
# Should return nothing after update
```

**CORS Error in Browser Console:**
- Update `CORS_ORIGINS` in API service to exact frontend URL
- Must include `https://`
- No trailing slash

**API Returns 500:**
```bash
# Check logs in Render dashboard
# Or use Render CLI:
render logs -s ecopredict-api --tail
```

**Slow First Load (Free Tier):**
- Expected behavior (cold start)
- Services sleep after 15 minutes inactivity
- First request takes 30-60 seconds
- Upgrade to Starter plan ($7/mo) for 24/7 uptime

---

## 💰 Cost Calculator

| Plan | API | Frontend | Total |
|------|-----|----------|-------|
| **Free** | $0 | $0 | **$0** |
| **Starter** | $7 | $7 | **$14** |
| **Standard** | $25 | $25 | **$50** |

Free tier: 750 hours/month shared across all services

---

## 📦 Files Created for Deployment

- ✅ `render.yaml` - Render Blueprint configuration
- ✅ `.env.example` - Environment variables template
- ✅ `RENDER_DEPLOY.md` - Complete deployment guide
- ✅ `deploy-to-render.ps1` - PowerShell deployment helper
- ✅ `deploy-to-render.sh` - Bash deployment helper
- ✅ `QUICK_DEPLOY.md` - This quick reference

---

## 🆘 Need Help?

**Full Guide:** See `RENDER_DEPLOY.md` for detailed instructions

**Render Docs:** https://render.com/docs

**Common Issues:** Search in `RENDER_DEPLOY.md` for:
- "Issue 1: API Returns 500 Error"
- "Issue 2: CORS Errors"
- "Issue 3: Cannot connect to API"
- "Issue 4: Slow Response Times"

---

**Ready to deploy! Run `.\deploy-to-render.ps1` or follow steps above** 🚀
