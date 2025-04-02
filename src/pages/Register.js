import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../constants'; 
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Register = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("UTILISATEUR"); // Default role is "UTILISATEUR"
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Le nom d'utilisateur et le mot de passe sont obligatoires.");
      return;
    }

    const payload = {
      username,
      password,
      role
    };

    try {
      const response = await axios.post(API_URL + '/api/v1/auth/register', payload);
      setSuccess("Enregistrement réussi !");
      setError(null);
      setUsername("");
      setPassword("");
      setRole("UTILISATEUR"); // Reset role to default

      // Save the token and role, then navigate to dashboard
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      
      // Navigate to dashboard after successful registration
      navigate("/dashboard");

    } catch (error) {
      setError("Erreur lors de l'enregistrement.");
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-4">
      <h1>Page d'Enregistrement</h1>

      {/* Success Message */}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Nom d'utilisateur</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Nom d'utilisateur" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Mot de passe</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Mot de passe" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rôle</Form.Label>
          <Form.Select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="UTILISATEUR">Utilisateur</option>
            <option value="ADMINISTRATEUR">Administrateur</option>
            <option value="RESPONSABLE">Responsable</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" onClick={handleRegister}>S'inscrire</Button>
      </Form>
    </Container>
  );
};

export default Register;
