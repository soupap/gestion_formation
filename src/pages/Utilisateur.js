import React, { useEffect, useState } from 'react';
import {
  Container, Table, Alert, Spinner,
  ButtonGroup, Button, Toast, ToastContainer,
  Modal
} from 'react-bootstrap';
import { api } from '../services/api';

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
      const response = await api.post(`/utilisateurs/updateRole/${userId}/${newRole}`);

      if (response.status === 200) {
        setUtilisateurs(prev => prev.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ));
        setToastMessage(`Rôle mis à jour avec succès pour l'utilisateur ${userId}`);
        setShowToast(true);
      } else {
        throw new Error(response.data?.message || "Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("Update role error:", err.response?.data || err.message);
      setToastMessage("Erreur lors de la mise à jour du rôle");
      setShowToast(true);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/utilisateurs/${userToDelete.id}`);

      setUtilisateurs(prev => prev.filter(u => u.id !== userToDelete.id));
      setToastMessage(`Utilisateur ${userToDelete.username} supprimé avec succès`);
      setShowToast(true);
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setToastMessage("Erreur lors de la suppression de l'utilisateur");
      setShowToast(true);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const getRoleVariant = (role) => {
    const variants = {
      ADMINISTRATEUR: 'danger',
      RESPONSABLE: 'warning',
      UTILISATEUR: 'primary'
    };
    return variants[role] || 'secondary';
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map(utilisateur => (
              <tr key={utilisateur.id}>
                <td>{utilisateur.id}</td>
                <td>{utilisateur.username}</td>
                <td>
                  <ButtonGroup size="sm">
                    {["UTILISATEUR", "RESPONSABLE", "ADMINISTRATEUR"].map(role => (
                      <Button
                        key={role}
                        variant={utilisateur.role === role ? getRoleVariant(role) : 'outline-secondary'}
                        disabled={utilisateur.role === role}
                        onClick={() => updateUserRole(utilisateur.id, role)}
                        className="text-nowrap"
                      >
                        {role}
                      </Button>
                    ))}
                  </ButtonGroup>
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleDeleteClick(utilisateur)}
                    disabled={utilisateur.role === "ADMINISTRATEUR"}
                    title={utilisateur.role === "ADMINISTRATEUR" ? "Cannot delete admin users" : ""}
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.username}</strong> ?
          Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Utilisateurs;