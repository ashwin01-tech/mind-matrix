import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NetworkVisualization from './pages/NetworkVisualization';
import './App.css'; // Global styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/network" element={<NetworkVisualization />} />
      </Routes>
    </Router>
  );
}

export default App;
