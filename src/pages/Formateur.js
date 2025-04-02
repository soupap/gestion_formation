import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { api } from '../services/api';

const Formateurs = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // New formateur fields
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [type, setType] = useState("INTERNE");

  useEffect(() => {
    fetchFormateurs();
  }, []);

  const fetchFormateurs = () => {
    setLoading(true);
    api.get('/formateurs')
      .then(response => {
        setFormateurs(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des formateurs.");
        setLoading(false);
      });
  };

  const handleAddFormateur = () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || !tel.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    const newFormateur = { nom, prenom, email, tel, type };

    api.post('/formateurs', newFormateur)
      .then(response => {
        // Optimistically update UI before fetching the updated list
        setFormateurs([...formateurs, response.data]);

        // Reset modal fields
        setShowModal(false);
        setNom(""); setPrenom(""); setEmail(""); setTel("");
        setType("INTERNE");
        setError(null);

        // Fetch the updated list from API
        fetchFormateurs();
      })
      .catch(() => {
        setError("Erreur lors de l'ajout du formateur.");
      });
  };

  return (
    <Container className="mt-4">
      <h1>Liste des Formateurs</h1>

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        Ajouter un Formateur
      </Button>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {formateurs.map(formateur => (
              <tr key={formateur.id}>
                <td>{formateur.id}</td>
                <td>{formateur.nom}</td>
                <td>{formateur.prenom}</td>
                <td>{formateur.email}</td>
                <td>{formateur.tel}</td>
                <td>{formateur.type}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for Adding Formateur */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Formateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nom</Form.Label>
              <Form.Control type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Prénom</Form.Label>
              <Form.Control type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Téléphone</Form.Label>
              <Form.Control type="text" placeholder="Téléphone" value={tel} onChange={(e) => setTel(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="INTERNE">Interne</option>
                <option value="EXTERNE">Externe</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleAddFormateur}>Ajouter</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Formateurs;
