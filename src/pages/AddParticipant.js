import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Modal, Row, Col } from 'react-bootstrap';
import { api } from '../services/api'; // Import the api service
import { FaPlus } from 'react-icons/fa'; // Import FaPlus for the button


const AddParticipant = ({ onParticipantAdded }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [structure, setStructure] = useState('');
  const [profilId, setProfilId] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profils, setProfils] = useState([]);
  const [showAddProfil, setShowAddProfil] = useState(false);
  const [newProfilLibelle, setNewProfilLibelle] = useState('');

  // Load profiles on component mount
  useEffect(() => {
    fetchProfils();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const participantData = {
      nom,
      prenom,
      email,
      tel,
      structure,
      profil: { id: profilId }, // Assuming you have the profile ID available
    };

    try {
      const response = await api.post('/participants', participantData);
      setSuccess('Participant ajouté avec succès!');
      setError(null);
      onParticipantAdded(response.data); // Update the list with the new participant
      setNom('');
      setPrenom('');
      setEmail('');
      setTel('');
      setStructure('');
      setProfilId('');
    } catch (error) {
      setError('Erreur lors de l\'ajout du participant.');
      setSuccess(null);
    }
  };

  const fetchProfils = async () => {
    try {
      const response = await api.get('/profils');
      setProfils(response.data);
    } catch (error) {
      setError('Erreur lors du chargement des profils');
    }
  };

  const handleAddProfil = async () => {
    try {
      const response = await api.post('/profils', { libelle: newProfilLibelle });
      await fetchProfils(); // Refresh the profile list
      setProfilId(response.data.id); // Select the new profile
      setShowAddProfil(false);
      setNewProfilLibelle('');
    } catch (error) {
      setError('Erreur lors de l\'ajout du profil');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Ajouter un Participant</h1>

      {/* Success Message */}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
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
          <Form.Label>Structure</Form.Label>
          <Form.Select
            type="text"
            placeholder="Structure"
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
            required
          >
            <option value="">Sélectionner une structure</option>
            <option value="CENTRALE">Centrale</option>
            <option value="REGIONALE">Régionale</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Profil</Form.Label>
          <Row>
            <Col xs={10}>
              <Form.Select
                value={profilId}
                onChange={(e) => setProfilId(e.target.value)}
                required
              >
                <option value="">Sélectionner un profil</option>
                {profils.map((profil) => (
                  <option key={profil.id} value={profil.id}>
                    {profil.libelle}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={2}>
              <Button
                variant="outline-secondary"
                onClick={() => setShowAddProfil(true)}
                title="Ajouter un nouveau profil"
              >
                <FaPlus />
              </Button>
            </Col>
          </Row>
        </Form.Group>

        {/* Add Profile Modal */}
        <Modal show={showAddProfil} onHide={() => setShowAddProfil(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Nouveau Profil</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Libellé du profil</Form.Label>
              <Form.Control
                type="text"
                value={newProfilLibelle}
                onChange={(e) => setNewProfilLibelle(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddProfil(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleAddProfil}>
              Enregistrer
            </Button>
          </Modal.Footer>
        </Modal>

        <Button variant="primary" type="submit">
          Ajouter Participant
        </Button>
      </Form>
    </Container>
  );
};

export default AddParticipant;
