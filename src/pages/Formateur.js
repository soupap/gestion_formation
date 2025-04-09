import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Button, Modal, Form } from 'react-bootstrap';
import { api } from '../services/api';

const Formateurs = () => {
  const userRole = localStorage.getItem("role");
  const [formateurs, setFormateurs] = useState([]);
  const [employeurs, setEmployeurs] = useState([]);
  const [employeurId, setEmployeurId] = useState("");
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
    fetchEmployeurs();
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

  const fetchEmployeurs = () => {
    api.get('/employeurs')
      .then(response => {
        setEmployeurs(response.data);
      })
      .catch(() => {
        setError("Erreur lors du chargement des employeurs.");
      });
  };

  const handleAddFormateur = () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || !tel.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    const newFormateur = {
      nom,
      prenom,
      email,
      tel,
      type,
      employeur: employeurId ? { id: employeurId } : null
    };

    api.post('/formateurs', newFormateur)
      .then(response => {
        setFormateurs([...formateurs, response.data]);
        setShowModal(false);
        resetForm();
        setError(null);
      })
      .catch(() => {
        setError("Erreur lors de l'ajout du formateur.");
      });
  };

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setEmail("");
    setTel("");
    setType("INTERNE");
    setEmployeurId("");
  };

  return (
    <Container className="mt-4">
      <h1>Liste des Formateurs</h1>
      {userRole === "ADMINISTRATEUR" && (
        <Button 
          variant="primary" 
          className="mb-3" 
          onClick={() => setShowModal(true)}
        >
          Ajouter un Formateur
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
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Employeur</th>
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
                <td>{formateur.employeur?.nomEmployeur || "Aucun employeur"}</td>
                <td>{formateur.type}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for Adding Formateur */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        resetForm();
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Formateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nom" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prénom</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Prénom" 
                value={prenom} 
                onChange={(e) => setPrenom(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Téléphone" 
                value={tel} 
                onChange={(e) => setTel(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="INTERNE">Interne</option>
                <option value="EXTERNE">Externe</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Employeur</Form.Label>
              <Form.Select 
                value={employeurId}
                onChange={(e) => setEmployeurId(e.target.value)}
              >
                <option value="">Sélectionner un employeur</option>
                {employeurs.map(employeur => (
                  <option key={employeur.id} value={employeur.id}>
                    {employeur.nomEmployeur}
                  </option>
                ))}
              </Form.Select>
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
          <Button variant="primary" onClick={handleAddFormateur}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Formateurs;