import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../constants';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserShield } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("UTILISATEUR");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Le nom d'utilisateur et le mot de passe sont obligatoires.");
      return;
    }

    const payload = { username, password, role };

    try {
      const response = await axios.post(API_URL + '/api/v1/auth/register', payload);
      setSuccess("Enregistrement réussi !");
      setError(null);
      setUsername("");
      setPassword("");
      setRole("UTILISATEUR");

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      navigate("/dashboard");

    } catch (error) {
      setError("Erreur lors de l'enregistrement.");
      setSuccess(null);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <h2 className="mb-4 text-center text-primary">Créer un compte</h2>

              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Nom d'utilisateur
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaLock className="me-2" />
                    Mot de passe
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FaUserShield className="me-2" />
                    Rôle
                  </Form.Label>
                  <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="UTILISATEUR">Utilisateur</option>
                    <option value="ADMINISTRATEUR">Administrateur</option>
                    <option value="RESPONSABLE">Responsable</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" size="lg" onClick={handleRegister}>
                    S'inscrire
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
