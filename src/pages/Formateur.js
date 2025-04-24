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
  const [deleteModalShow, setDeleteModalShow] = useState(false); // State for delete confirmation modal
  const [deleteError, setDeleteError] = useState(null);
  const [formateurToDelete, setFormateurToDelete] = useState(null); // Track the formateur to delete

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
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des formateurs.");
        setLoading(false);
      });
  };

  const fetchEmployeurs = () => {
    api.get('/employeurs')
      .then(response => {
        setEmployeurs(response.data);
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des employeurs.");
      });
  };

  const handleDeleteFormateur = (id) => {
    setFormateurToDelete(id);
    setDeleteModalShow(true); // Show the confirmation modal
  };

  const confirmDeleteFormateur = () => {
    api.delete(`/formateurs/${formateurToDelete}`)
      .then(() => {
        setFormateurs(formateurs.filter(f => f.id !== formateurToDelete));
        setDeleteError(null); // Clear any previous errors
        setDeleteModalShow(false); // Close the modal
        setFormateurToDelete(null); // Reset the formateur to delete
      })
      .catch(error => {
        const msg = error.response?.data?.message || "Erreur lors de la suppression du formateur.";
        setDeleteError(msg);
        setDeleteModalShow(false); // Close the modal on error
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
      employeur: employeurId ? { id: Number(employeurId) } : null
    };

    api.post('/formateurs', newFormateur)
      .then(response => {
        setShowModal(false);
        resetForm();
        setError(null);
        fetchFormateurs(); // re-fetch to include new formateur
      })
      .catch(err => {
        console.error(err);
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
      {deleteError && (
        <Alert variant="warning" onClose={() => setDeleteError(null)} dismissible>
          {deleteError}
        </Alert>
      )}


      <Button
        variant="primary"
        className="mb-3"
        onClick={() => setShowModal(true)}
      >
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
              <th>Employeur</th>
              <th>Type</th>
              {(userRole === "ADMINISTRATEUR" || userRole === "UTILISATEUR") && <th>Actions</th>}

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
                {(userRole === "ADMINISTRATEUR" || userRole === "UTILISATEUR") && (
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteFormateur(formateur.id)}
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

      {/* Modal for Adding Formateur */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Formateur</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddFormateur();
          }}
          required
        >
          <Modal.Body>
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
            {(type === "EXTERNE" && (
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
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Ajouter
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal for Deletion Confirmation */}
      <Modal
        show={deleteModalShow}
        onHide={() => setDeleteModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer ce formateur ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalShow(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDeleteFormateur}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Formateurs;
