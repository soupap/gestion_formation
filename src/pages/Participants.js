import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal } from 'react-bootstrap';
import { api } from '../services/api'; // Import the api service
import AddParticipant from './AddParticipant';

const ParticipantsList = () => {
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await api.get('/participants');
        setParticipants(response.data);
      } catch (error) {
        setError('Erreur lors de la récupération des participants.');
      }
    };

    fetchParticipants();
  }, []);

  const handleParticipantAdded = (newParticipant) => {
    setParticipants((prevParticipants) => [...prevParticipants, newParticipant]);
  };

  return (
    <Container className="mt-4">
      <h1>Liste des Participants</h1>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Add Participant Button */}
      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        Ajouter un participant
      </Button>

      {/* Participant List */}
      <Row className="mt-4">
        {participants.length > 0 ? (
          participants.map((participant) => (
            <Col key={participant.id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{participant.nom} {participant.prenom}</Card.Title>
                  <Card.Text>
                    Email: {participant.email} <br />
                    Téléphone: {participant.tel} <br />
                    Structure: {participant.structure} <br />
                    Profil: {participant.profil?.id}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Alert variant="info">Aucun participant trouvé.</Alert>
        )}
      </Row>
      {/* Modal for Adding Participant */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body>
          <AddParticipant onParticipantAdded={handleParticipantAdded} setShowModal={setShowModal} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ParticipantsList;
