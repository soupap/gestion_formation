import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { api } from '../services/api';

const Domaines = () => {
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New domaine fields
  const [libelle, setLibelle] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDomaines();
  }, []);

  const fetchDomaines = () => {
    setLoading(true);
    api.get('/domaines')  // Corrected this line
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
        setLibelle(""); // Clear the input field
        setError(null);
        fetchDomaines(); // Refresh the list after adding
      })
      .catch(() => {
        setError("Erreur lors de l'ajout du domaine.");
      });
  };

  return (
    <Container className="mt-4">
      <h1>Liste des Domaines</h1>

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        Ajouter un Domaine
      </Button>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Libellé</th>
            </tr>
          </thead>
          <tbody>
            {domaines.map(domaine => (
              <tr key={domaine.id}>
                <td>{domaine.id}</td>
                <td>{domaine.libelle || "Aucun libellé"}</td>
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
    </Container>
  );
};

export default Domaines;
