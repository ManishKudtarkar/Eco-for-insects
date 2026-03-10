# EcoPredict React Frontend

This is the React-based frontend for the EcoPredict biodiversity forecasting platform. It provides a modern, interactive user interface for visualizing insect population predictions and analytics.

## Features

- 🏠 **Home Page**: Hero section with call-to-action
- 📊 **Dashboard**: Real-time biodiversity metrics and charts
- 🗺️ **Risk Map**: Global assessment of biodiversity threats
- 📈 **Analytics**: Correlation analysis between environmental factors
- ℹ️ **About**: Mission and vision information
- 🔐 **Authentication**: Login and signup pages

## Technology Stack

- **React** 19.2.3
- **React Router** 7.12.0 for navigation
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons
- **Ant Design** for UI components
- **TailwindCSS** for styling

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. Navigate to the frontend directory:
```bash
cd react-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
react-frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Cards.js
│   │   ├── Footer.js
│   │   ├── Mainlayout.js
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── about.js
│   │   ├── analytics.js
│   │   ├── dashboard.js
│   │   ├── home.js
│   │   ├── login.js
│   │   ├── riskmap.js
│   │   └── signup.js
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   ├── index.js
│   └── reportWebVitals.js
└── package.json
```

## Backend Integration

The frontend is configured to connect to the FastAPI backend through a proxy. Update the `proxy` field in `package.json` to point to your backend API:

```json
"proxy": "http://localhost:8000"
```

For production deployments, ensure your nginx configuration properly routes API requests to the backend.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Docker Deployment

The frontend can be containerized using the provided Dockerfile.web. See the main project README for docker-compose instructions.

## Contributing

This is part of the EcoPredict project. For contribution guidelines, please refer to the main project repository.

## License

Copyright © 2026 EcoPredict. All rights reserved.
