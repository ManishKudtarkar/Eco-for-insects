import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & Components
import MainLayout from './components/Mainlayout';

// Pages
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import RiskMap from './pages/riskmap';
import Analytics from './pages/analytics';
import About from './pages/about';
import Search from './pages/search';
import Login from './pages/login';
import Signup from './pages/signup';

// Styles
import './index.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with navigation and footer */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/risk-map" element={<MainLayout><RiskMap /></MainLayout>} />
        <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
        <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        
        {/* Auth pages full screen */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Fallback */}
        <Route path="*" element={<MainLayout><Home /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
