import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import CustomNavbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import Participants from './pages/Participants';
import Utilisateur from './pages/Utilisateur';
import Login from './pages/Login';
import Register from './pages/Register';
import Domaine from './pages/Domaine';
import PrivateRoute from './components/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import Employeur from './pages/Employeur';
import Formateur from './pages/Formateur';
import FormationDetails from './pages/FormationDetails';
import ParticipantDetail from './pages/ParticipantDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const location = useLocation();

  const isLoginPage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/register';

  const role = localStorage.getItem('role');
  const isAdmin = role === 'ADMINISTRATEUR';
  const isUser = role === 'UTILISATEUR';
  const isResponsable = role === 'RESPONSABLE';

  return (
    <>
      {/* Show navbar only if not on login or register page */}
      {!isLoginPage && !isRegisterPage && <CustomNavbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes that require authentication */}
        <Route element={<PrivateRoute />}>
          {/* Only RESPONSABLE can access dashboard, others redirected to /formations */}
          <Route
            path="/dashboard"
            element={isResponsable ? <Dashboard /> : <Navigate to="/formations" replace />}
          />

          <Route path="/formations" element={<Formations />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/participants/:id" element={<ParticipantDetail />} />
          <Route path="/domaine" element={<Domaine />} />
          <Route path="/formateur" element={<Formateur />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/formations/:id" element={<FormationDetails />} />
          <Route path="/employeur" element={<Employeur />} />

          {/* Only admin can access /utilisateur */}
          {isAdmin && <Route path="/utilisateur" element={<Utilisateur />} />}
        </Route>
      </Routes>
    </>
  );
}

export default App;
