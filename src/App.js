import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import Participants from './pages/Participants';
import Utilisateur from './pages/Utilisateur';
import Login from './pages/Login';
import Register from './pages/Register'; // Ensure Register component exists
import Domaine from './pages/Domaine';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import Employeur from './pages/Employeur';
import Formateur from './pages/Formateur';
import FormationDetails from './pages/FormationDetails';
import ParticipantDetail from './pages/ParticipantDetail';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const location = useLocation();
  
  // Check if the current path is the login or register page 
  const isLoginPage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/register';
  
  // Check if the user is an admin (role is stored in localStorage)
  const isAdmin = localStorage.getItem('role') === 'ADMINISTRATEUR';
  const isUser = localStorage.getItem('role') === 'UTILISATEUR'; // Check if the user is a formateur
  return (
    <>
      {/* Render navbar only if not on the login or register page */}
      {!isLoginPage && !isRegisterPage && <CustomNavbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Assuming you have a Register component */}
        
        {/* PrivateRoute protects routes that require authentication */}
        <Route element={<PrivateRoute />}>
          {/* Only render the dashboard if the user is not a formateur */}
          {!isUser && <Route path="/dashboard" element={<Dashboard />} />}
          <Route path="/formations" element={<Formations />} />
          <Route path="/participants" element={<Participants />} />

          {/* Only render the following routes if the user is an admin */}
          {isAdmin && (
            <>
              <Route path="/utilisateur" element={<Utilisateur />} />
            </>
          )}
          <Route path="/participants/:id" element={<ParticipantDetail />} />
          <Route path="/domaine" element={<Domaine />} />
          <Route path="/formateur" element={<Formateur />} />
          <Route path="/formations/:id" element={<FormationDetails />} />
          <Route path="/employeur" element={<Employeur />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
