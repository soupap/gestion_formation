import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import Participants from './pages/Participants';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <CustomNavbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/formations" element={<Formations />} />
        <Route path="/participants" element={<Participants />} />
      </Routes>
    </Router>
  );
}

export default App;