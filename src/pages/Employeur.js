import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { api } from '../services/api';

const Employeur = () => {
  const userRole = localStorage.getItem("role");
  const [employeurs, setEmployeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // New employer fields
  const [nomEmployeur, setNomEmployeur] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

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

    const newEmployeur = {
      nomEmployeur,
      adresse,
      email,
      telephone
    };

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

      {!loading && !error && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
            </tr>
          </thead>
          <tbody>
            {employeurs.map(employeur => (
              <tr key={employeur.id}>
                <td>{employeur.id}</td>
                <td>{employeur.nomEmployeur}</td>
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
    </Container>
  );
};

export default Employeur;