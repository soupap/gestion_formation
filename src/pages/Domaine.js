import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { api } from '../services/api';

const Domaines = () => {
  const userRole = localStorage.getItem("role");
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null); // ✅ New error state for delete

  // New domaine fields
  const [libelle, setLibelle] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Modal for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [domaineToDelete, setDomaineToDelete] = useState(null);

  useEffect(() => {
    fetchDomaines();
  }, []);

  const fetchDomaines = () => {
    setLoading(true);
    api.get('/domaines')
      .then(response => {
        setDomaines(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des domaines.");
        setLoading(false);
      });
  };

  const handleAddDomaine = () => {
    if (!libelle.trim()) {
      setError("Le libellé est obligatoire.");
      return;
    }

    const newDomaine = { libelle };

    api.post('/domaines', newDomaine)
      .then(() => {
        setShowModal(false);
        setLibelle("");
        setError(null);
        fetchDomaines(); // Refresh
      })
      .catch(() => {
        setError("Erreur lors de l'ajout du domaine.");
      });
  };

  // ✅ Handle delete
  const handleDeleteDomaine = () => {
    if (!domaineToDelete) return;

    api.delete(`/domaines/${domaineToDelete.id}`)
      .then(() => {
        setDomaines(domaines.filter(d => d.id !== domaineToDelete.id));
        setDeleteError(null);
      })
      .catch(error => {
        const msg = error.response?.data?.message || "Ce domaine ne peut pas être supprimé.";
        setDeleteError(msg);
      })
      .finally(() => {
        setShowDeleteModal(false);
        setDomaineToDelete(null);
      });
  };

  const openDeleteModal = (domaine) => {
    setDomaineToDelete(domaine);
    setShowDeleteModal(true);
  };

  return (
    <Container className="mt-4">
      <h1>Liste des Domaines</h1>

      {userRole === "ADMINISTRATEUR" && (
        <Button 
          variant="primary" 
          className="mb-3" 
          onClick={() => setShowModal(true)}
        >
          Ajouter un Domaine
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
              <th>Libellé</th>
              {userRole === "ADMINISTRATEUR" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {domaines.map(domaine => (
              <tr key={domaine.id}>
                <td>{domaine.id}</td>
                <td>{domaine.libelle || "Aucun libellé"}</td>
                {userRole === "ADMINISTRATEUR" && (
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => openDeleteModal(domaine)}
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

      {/* Modal for Adding Domaine */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Domaine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Libellé</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Libellé du domaine" 
                value={libelle} 
                onChange={(e) => setLibelle(e.target.value)} 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleAddDomaine}>Ajouter</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer le domaine <strong>{domaineToDelete?.libelle}</strong> ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteDomaine}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Domaines;
