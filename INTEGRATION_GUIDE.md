# React Frontend Integration Guide

## Overview

This guide explains the integration of the React frontend from the ecoPredict GitHub repository (https://github.com/Kavya070605/ecoPredict) with your existing Eco-for-insects FastAPI backend.

## What Was Integrated

### New React Frontend Structure
A complete React application has been set up in the `react-frontend/` directory with the following features:

**Pages:**
- 🏠 **Home** - Hero section with features and call-to-action
- 📊 **Dashboard** - Real-time biodiversity metrics with interactive charts
- 🗺️ **Risk Map** - Global threat assessment map
- 📈 **Analytics** - Correlation analysis between environmental factors
- ℹ️ **About** - Mission and vision
- 🔐 **Login/Signup** - Authentication pages

**Components:**
- Navbar with sticky navigation
- Footer with links and social media
- StatCard and InsightCard components for data display
- MainLayout wrapper component

**Technology Stack:**
- React 19.2.3 with React Router
- Framer Motion for animations
- Recharts for data visualization
- Lucide React for icons
- Ant Design for UI components
- TailwindCSS for styling

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │─────>│    Nginx     │─────>│   React     │
│             │      │   (Port 80)  │      │   (Port 80) │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            │ /api/*
                            │
                            ▼
                     ┌──────────────┐
                     │   FastAPI    │
                     │  (Port 8000) │
                     └──────────────┘
```

## File Structure

```
Eco-for-insects-main/
├── react-frontend/                # NEW React application
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cards.js
│   │   │   ├── Footer.js
│   │   │   ├── Mainlayout.js
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── home.js
│   │   │   ├── dashboard.js
│   │   │   ├── analytics.js
│   │   │   ├── riskmap.js
│   │   │   ├── about.js
│   │   │   ├── login.js
│   │   │   └── signup.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── Dockerfile             # NEW Docker configuration
│   ├── nginx.conf             # NEW Nginx config for React
│   ├── package.json
│   └── README.md
├── frontend/                  # OLD HTML/CSS/JS frontend (kept for comparison)
├── src/                       # FastAPI backend (unchanged)
├── nginx/
│   └── nginx.conf             # UPDATED to route to React
├── docker-compose.yml         # UPDATED with React service
└── INTEGRATION_GUIDE.md       # This file
```

## Docker Configuration Changes

### Added React Frontend Service
The `docker-compose.yml` now includes:
- **`react-web`** service: Builds and serves the React application
- **`web`** service: Renamed to keep the legacy frontend on port 8081

### Service Ports
- **Port 80**: Main nginx reverse proxy → Routes to React frontend
- **Port 8080**: React frontend container (internal)
- **Port 8081**: Legacy HTML frontend (optional, for comparison)
- **Port 8000**: FastAPI backend
- **Port 3000**: Grafana dashboard
- **Port 9090**: Prometheus metrics

## Getting Started

### Option 1: Run with Docker (Recommended)

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the applications:**
   - React Frontend: http://localhost (port 80)
   - Legacy Frontend: http://localhost:8081
   - API Docs: http://localhost/api/docs
   - Grafana: http://localhost:3000

3. **Stop services:**
   ```bash
   docker-compose down
   ```

### Option 2: Run React Frontend Locally (Development)

1. **Install dependencies:**
   ```bash
   cd react-frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Access at:** http://localhost:3000

   Note: The backend API must be running separately for full functionality.

### Option 3: Production Build

1. **Build the React app:**
   ```bash
   cd react-frontend
   npm run build
   ```

2. **The optimized build will be in:** `react-frontend/build/`

## Backend API Integration

The React frontend is configured to communicate with your FastAPI backend through the nginx reverse proxy:

### API Endpoints Used
- `GET /api/health` - Health check
- `GET /api/metrics` - Prometheus metrics
- `POST /api/predict` - Biodiversity predictions
- `GET /api/regions` - Available regions
- `GET /api/species` - Species information

### CORS Configuration
The nginx configuration handles CORS to allow the frontend to communicate with the backend. The frontend makes requests to `/api/*` which are proxied to the FastAPI backend.

## Customization

### Update API URL
If you're running the backend on a different host or port, update the proxy configuration in:
- **Development:** `react-frontend/package.json` → `"proxy": "http://your-api-host:8000"`
- **Production:** `nginx/nginx.conf` → Update the `api_backend` upstream

### Styling
The React app uses CSS-in-JS with custom CSS variables defined in `src/index.css`:
```css
:root {
  --color-forest: #1A3C34;
  --color-moss: #3E6A53;
  --color-leaf: #81A88D;
  --color-accent: #C7D989;
  /* ... more variables */
}
```

Modify these values to match your branding.

### Adding New Pages
1. Create a new file in `react-frontend/src/pages/`
2. Import it in `App.js`
3. Add a route in the `<Routes>` component

## Troubleshooting

### Issue: React page shows blank screen
**Solution:** Check the browser console for errors. Ensure all dependencies are installed:
```bash
cd react-frontend
npm install
```

### Issue: API calls return 404
**Solution:** 
- Verify the API service is running: `docker ps`
- Check nginx logs: `docker logs ecopredict-nginx`
- Ensure the backend is healthy: http://localhost/api/health

### Issue: Docker build fails
**Solution:**
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker-compose up --build --force-recreate`

### Issue: Port already in use
**Solution:**
- Stop conflicting services
- Or change ports in `docker-compose.yml`

## Next Steps

### Connect to Real Backend Data
Currently, the Dashboard and Analytics pages use mock data. To connect to your real API:

1. Create an API service file `react-frontend/src/services/api.js`:
```javascript
const API_BASE = '/api';

export const fetchBiodiversityData = async () => {
  const response = await fetch(`${API_BASE}/biodiversity`);
  return response.json();
};

export const makePrediction = async (data) => {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

2. Use these functions in your components with React hooks:
```javascript
import { useEffect, useState } from 'react';
import { fetchBiodiversityData } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchBiodiversityData().then(setData);
  }, []);
  
  // ... render with real data
};
```

### Add Authentication
Implement JWT or OAuth authentication:
- Update the login/signup pages to actually authenticate
- Store tokens in localStorage or cookies
- Add protected routes
- Send auth tokens with API requests

### Deploy to Production
1. Set up environment variables
2. Configure SSL certificates in `nginx/ssl/`
3. Update `nginx.conf` to use HTTPS
4. Use a reverse proxy like Cloudflare or AWS ELB
5. Set up CI/CD pipelines

## Comparison: Old vs New Frontend

| Feature | Old Frontend | New React Frontend |
|---------|-------------|-------------------|
| Framework | Vanilla JS | React 19.2 |
| Routing | Single page | React Router (multi-page) |
| State Management | Global object | React hooks |
| Animations | CSS transitions | Framer Motion |
| Charts | Plotly.js | Recharts |
| Build Process | None | Webpack (via CRA) |
| Code Organization | Single files | Component-based |
| Bundle Size | ~500KB | ~800KB (optimized) |
| Developer Experience | Basic | Modern tooling |

## Resources

- **React Documentation:** https://react.dev
- **React Router:** https://reactrouter.com
- **Framer Motion:** https://www.framer.com/motion/
- **Recharts:** https://recharts.org
- **Lucide Icons:** https://lucide.dev
- **Ant Design:** https://ant.design

## Support

For issues related to:
- **Frontend bugs:** Check the browser console and React error boundaries
- **Backend integration:** Review the FastAPI logs and nginx logs
- **Docker issues:** Check `docker logs <container-name>`

## Credits

Frontend design inspired by the ecoPredict repository by Kavya070605.
Integrated and adapted for the Eco-for-insects project.

---

**Last Updated:** March 3, 2026  
**Integration Version:** 1.0.0
