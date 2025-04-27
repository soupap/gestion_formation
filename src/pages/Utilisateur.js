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
  const [toastType, setToastType] = useState('success');
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
        // Show API error message if it exists, else static error
        const apiError = err.response?.data;
        if (apiError && (apiError.error || apiError.message)) {
          setError(`${apiError.error ? apiError.error + ': ' : ''}${apiError.message || ''}`.trim());
        } else if (typeof apiError === 'string') {
          setError(apiError);
        } else {
          setError("Erreur lors du chargement des utilisateurs.");
        }
        console.error("Fetch users error:", apiError || err.message);
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
        setToastType('success');
        setToastMessage(`Rôle mis à jour avec succès pour l'utilisateur ${userId}`);
        setShowToast(true);
      } else {
        throw new Error(response.data?.message || "Réponse inattendue du serveur");
      }
    } catch (err) {
      // Show API error message if it exists, else static error
      const apiError = err.response?.data;
      if (apiError && (apiError.error || apiError.message)) {
        setToastType('danger');
        setToastMessage(`${apiError.error ? apiError.error + ': ' : ''}${apiError.message || ''}`.trim());
      } else if (typeof apiError === 'string') {
        setToastType('danger');
        setToastMessage(apiError);
      } else {
        setToastType('danger');
        setToastMessage("Erreur lors de la mise à jour du rôle");
      }
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
      setToastType('success');
      setToastMessage(`Utilisateur ${userToDelete.username} supprimé avec succès`);
      setShowToast(true);
    } catch (err) {
      // Show API error message if it exists, else static error
      const apiError = err.response?.data;
      if (apiError && (apiError.error || apiError.message)) {
        setToastType('danger');
        setToastMessage(`${apiError.error ? apiError.error + ': ' : ''}${apiError.message || ''}`.trim());
      } else if (typeof apiError === 'string') {
        setToastType('danger');
        setToastMessage(apiError);
      } else {
        setToastType('danger');
        setToastMessage("Erreur lors de la suppression de l'utilisateur");
      }
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

      {/* Toast for success or error */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast || !!error}
          onClose={() => {
            setShowToast(false);
            setError(null);
          }}
          delay={3000}
          autohide
          bg={toastType ? "danger" : "success"}
        >
          <Toast.Header>
            <strong className="me-auto">{toastType ? "Erreur" : "Succès"}</strong>
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