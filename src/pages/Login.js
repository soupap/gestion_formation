import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../constants';
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);  // State for password visibility

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "UTILISATEUR") {
        navigate("/formations");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(API_URL + "/api/v1/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      if (response.data.role === "UTILISATEUR") {
        navigate("/formations");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      const apiError = error.response?.data;
      if (apiError && (apiError.error || apiError.message)) {
        setError(apiError.message);
      } else if (typeof apiError === 'string') {
        setError(apiError);
      } else {
        setError("Échec de la connexion.");
      }
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-lg p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center text-primary mb-4">Connexion</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
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
              required
              autoFocus
              onFocus={() => setError("")}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>
              <FaLock className="me-2" />
              Mot de passe
            </Form.Label>
            <div className="position-relative">
              <Form.Control
                type={passwordVisible ? "text" : "password"}  // Toggle the type based on visibility state
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onFocus={() => setError("")}
              />
              <Button
                variant="link"
                onClick={togglePasswordVisibility}
                className="position-absolute end-0 top-50 translate-middle-y"
                style={{ fontSize: "1.25rem" }}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </div>
          </Form.Group>

          <div className="d-grid mb-2">
            <Button type="submit" variant="primary" size="lg">
              Se connecter
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default Login;
