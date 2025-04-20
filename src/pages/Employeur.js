import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { api } from '../services/api';

const Employeur = () => {
  const userRole = localStorage.getItem("role");
  const [employeurs, setEmployeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Modal for add
  const [nomEmployeur, setNomEmployeur] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  // Modal for delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeurToDelete, setEmployeurToDelete] = useState(null);

  useEffect(() => {
    fetchEmployeurs();
  }, []);

  const fetchEmployeurs = () => {
    setLoading(true);
    api.get('/employeurs')
      .then(response => {
        setEmployeurs(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des employeurs.");
        setLoading(false);
      });
  };

  const handleAddEmployeur = () => {
    if (!nomEmployeur.trim()) {
      setError("Le nom de l'employeur est obligatoire.");
      return;
    }

    const newEmployeur = { nomEmployeur, adresse, email, telephone };

    api.post('/employeurs', newEmployeur)
      .then(response => {
        setEmployeurs([...employeurs, response.data]);
        setShowModal(false);
        resetForm();
        setError(null);
      })
      .catch(() => {
        setError("Erreur lors de l'ajout de l'employeur.");
      });
  };

  const handleDeleteConfirm = () => {
    if (!employeurToDelete) return;

    api.delete(`/employeurs/${employeurToDelete.id}`)
      .then(() => {
        setEmployeurs(employeurs.filter(e => e.id !== employeurToDelete.id));
        setDeleteError(null);
      })
      .catch(error => {
        const msg = error.response?.data?.message || "Cet employeur ne peut pas être supprimé.";
        setDeleteError(msg);
      })
      .finally(() => {
        setShowDeleteModal(false);
        setEmployeurToDelete(null);
      });
  };

  const openDeleteModal = (employeur) => {
    setEmployeurToDelete(employeur);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setNomEmployeur("");
    setAdresse("");
    setEmail("");
    setTelephone("");
  };

  return (
    <Container className="mt-4">
      <h1>Liste des employeurs</h1>

      {userRole === "ADMINISTRATEUR" && (
        <Button 
          variant="primary" 
          className="mb-3" 
          onClick={() => setShowModal(true)}
        >
          Ajouter un Employeur
        </Button>
      )}

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {deleteError && (
        <Alert variant="warning" dismissible onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      {!loading && !error && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              {userRole === "ADMINISTRATEUR" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {employeurs.map(employeur => (
              <tr key={employeur.id}>
                <td>{employeur.id}</td>
                <td>{employeur.nomEmployeur}</td>
                {userRole === "ADMINISTRATEUR" && (
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => openDeleteModal(employeur)}
                    >
                      Supprimer
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for Adding Employer */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        resetForm();
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Employeur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'employeur *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nom" 
                value={nomEmployeur} 
                onChange={(e) => setNomEmployeur(e.target.value)} 
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            resetForm();
          }}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleAddEmployeur}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Modal for Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer l'employeur <strong>{employeurToDelete?.nomEmployeur}</strong> ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Employeur;
