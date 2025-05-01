import React, { useEffect, useState } from 'react';
import {
  Container, Table, Alert, Spinner,
  ButtonGroup, Button, Toast, ToastContainer,
  Modal, Form
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
  // Add new state variables for user creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "UTILISATEUR"
  });
  const [showPassword, setShowPassword] = useState(false);

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

  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      setToastType('danger');
      setToastMessage("Le nom d'utilisateur et le mot de passe sont obligatoires.");
      setShowToast(true);
      return;
    }

    try {
      const response = await api.post('/api/v1/auth/register', newUser);
      setUtilisateurs([...utilisateurs, response.data]);
      setToastType('success');
      setToastMessage("Utilisateur créé avec succès!");
      setShowToast(true);
      setShowAddModal(false);
      setNewUser({ username: "", password: "", role: "UTILISATEUR" });
    } catch (error) {
      const apiError = error.response?.data;
      setToastType('danger');
      setToastMessage(apiError?.message || "Erreur lors de la création de l'utilisateur");
      setShowToast(true);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Liste des Utilisateurs</h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Ajouter un utilisateur
        </Button>
      </div>

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
          bg={toastType === 'danger' ? 'danger' : 'success'}
        >
          <Toast.Header>
            <strong className="me-auto">{toastType === 'danger' ? "Erreur" : "Succès"}</strong>
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

      {/* Add user modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom d'utilisateur"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Entrez le mot de passe"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <Form.Check
                type="checkbox"
                label="Afficher le mot de passe"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label>Rôle</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="UTILISATEUR">UTILISATEUR</option>
                <option value="RESPONSABLE">RESPONSABLE</option>
                <option value="ADMINISTRATEUR">ADMINISTRATEUR</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleAddUser}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Utilisateurs;