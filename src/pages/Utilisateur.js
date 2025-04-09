import React, { useEffect, useState } from 'react';
import { 
  Container, Table, Alert, Spinner, 
  ButtonGroup, Button, Badge, Toast, ToastContainer
} from 'react-bootstrap';
import { api } from '../services/api';

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [apiError, setApiError] = useState(null);
  const currentUserRole = localStorage.getItem("role");

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = () => {
    setLoading(true);
    api.get('/utilisateurs')
      .then(response => {
        setUtilisateurs(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur lors du chargement des utilisateurs.");
        console.error("Fetch users error:", err.response?.data || err.message);
        setLoading(false);
      });
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setApiError(null);
      const response = await api.post(`/utilisateurs/updateRole/${userId}/${newRole}`);
      
      console.log("API Response:", response); // Debug log
      
      if (response.status === 200) {
        setUtilisateurs(prev => prev.map(u => 
          u.id === userId ? {...u, role: newRole} : u
        ));
        setToastMessage(`Rôle mis à jour avec succès pour l'utilisateur ${userId}`);
        setShowToast(true);
      } else {
        throw new Error(response.data?.message || "Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("Update role error:", err.response?.data || err.message);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMINISTRATEUR: 'danger',
      RESPONSABLE: 'warning',
      UTILISATEUR: 'primary'
    };
    return <Badge bg={variants[role]}>{role}</Badge>;
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Liste des Utilisateurs</h1>

      {/* Loading spinner */}
      {loading && <Spinner animation="border" className="d-block mx-auto" />}

      {/* Error alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* API error details - visible for debugging */}
      {apiError && (
        <Alert variant="danger" className="mt-3">
          <p>{apiError.message}</p>
        </Alert>
      )}

      {/* Success toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Succès</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Users table */}
      {!loading && !error && (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="bg-light">
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Rôle actuel</th>
              {currentUserRole === "ADMINISTRATEUR" && <th>Modifier le rôle</th>}
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map(utilisateur => (
              <tr key={utilisateur.id}>
                <td>{utilisateur.id}</td>
                <td>{utilisateur.username}</td>
                <td>{getRoleBadge(utilisateur.role)}</td>
                
                {currentUserRole === "ADMINISTRATEUR" && (
                  <td>
                    <ButtonGroup size="sm">
                      {["UTILISATEUR", "RESPONSABLE", "ADMINISTRATEUR"].map(role => (
                        <Button
                          key={role}
                          variant={utilisateur.role === role ? 'dark' : 'outline-secondary'}
                          disabled={utilisateur.role === role}
                          onClick={() => updateUserRole(utilisateur.id, role)}
                          className="text-nowrap"
                        >
                          {role}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Utilisateurs;