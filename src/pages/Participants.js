import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Spinner, Form } from 'react-bootstrap';
import { api } from '../services/api';
import AddParticipant from './AddParticipant';
import { FaUserPlus, FaInfoCircle, FaTrashAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ParticipantsList = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [formations, setFormations] = useState([]);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedFormationId, setSelectedFormationId] = useState('');
  const [loading, setLoading] = useState({
    participants: true,
    formations: false,
    enroll: false,
    delete: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantsRes, formationsRes] = await Promise.all([
          api.get('/participants'),
          api.get('/formations')
        ]);
        setParticipants(participantsRes.data);
        setFormations(formationsRes.data);
      } catch (error) {
        setError('Error loading data');
      } finally {
        setLoading(prev => ({ ...prev, participants: false }));
      }
    };

    fetchData();
  }, []);

  const handleParticipantAdded = (newParticipant) => {
    setParticipants(prev => [...prev, newParticipant]);
    setShowAddModal(false);
  };

  const openEnrollModal = (participant) => {
    setSelectedParticipant(participant);
    setSelectedFormationId('');
    setShowEnrollModal(true);
  };

  const handleEnroll = async () => {
    if (!selectedParticipant || !selectedFormationId) return;

    setLoading(prev => ({ ...prev, enroll: true }));
    try {
      await api.put(`/participants/${selectedParticipant.id}/formations/${selectedFormationId}`);

      // Update the participant's formations in the local state
      setParticipants(prev =>
        prev.map(p =>
          p.id === selectedParticipant.id
            ? {
              ...p,
              formations: [
                ...(p.formations || []),
                formations.find(f => f.id === selectedFormationId)
              ]
            }
            : p
        )
      );

      setShowEnrollModal(false);
    } catch (error) {
      setError('Error enrolling participant');
    } finally {
      setLoading(prev => ({ ...prev, enroll: false }));
    }
  };

  const openDeleteModal = (participant) => {
    setSelectedParticipant(participant);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedParticipant) return;

    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await api.delete(`/participants/${selectedParticipant.id}`);
      setParticipants(prev => prev.filter(p => p.id !== selectedParticipant.id));
      setShowDeleteModal(false);
    } catch (error) {
      setError('Error deleting participant');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Liste des Participants</h1>

      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={() => setError(null)}>
            <FaTimes />
          </Button>
        </Alert>
      )}

      <div className="d-flex justify-content-between mb-4">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Ajouter un participant
        </Button>
      </div>

      {loading.participants ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading participants...</p>
        </div>
      ) : participants.length > 0 ? (
        <Row>
          {participants.map((participant) => (
            <Col key={participant.id} md={4} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>
                    {participant.nom} {participant.prenom}
                  </Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {participant.email || 'N/A'}<br />
                    <strong>Téléphone:</strong> {participant.tel || 'N/A'}<br />
                    <strong>Structure:</strong> {participant.structure || 'N/A'}<br />
                    <strong>Formations:</strong> {participant.formations?.length || 0}
                  </Card.Text>
                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => openEnrollModal(participant)}
                      disabled={loading.enroll}
                      aria-label="Enroll"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Enroll"
                    >
                      <FaUserPlus />
                    </Button>

                    <Button
                      variant="info"
                      size="sm"
                      aria-label="View Details"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Details"
                      onClick={() => navigate(`/participants/${participant.id}`)}
                    >
                      <FaInfoCircle />
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(participant)}
                      disabled={loading.delete}
                      aria-label="Delete"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </Button>
                  </div>

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">Aucun participant trouvé.</Alert>
      )}

      {/* Add Participant Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un participant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddParticipant
            onParticipantAdded={handleParticipantAdded}
            onClose={() => setShowAddModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Enroll Participant Modal */}
      <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Enroll {selectedParticipant?.nom} {selectedParticipant?.prenom}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formationSelect">
              <Form.Label>Select Formation</Form.Label>
              <Form.Select
                value={selectedFormationId}
                onChange={(e) => setSelectedFormationId(e.target.value)}
                disabled={loading.enroll}
              >
                <option value="">Select a formation</option>
                {formations.map(formation => (
                  <option key={formation.id} value={formation.id}>
                    {formation.titre} ({formatDate(formation.dateDebut)})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEnrollModal(false)}
            disabled={loading.enroll}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEnroll}
            disabled={!selectedFormationId || loading.enroll}
          >
            {loading.enroll ? (
              <>
                <Spinner as="span" size="sm" animation="border" /> Enrolling...
              </>
            ) : (
              'Enroll Participant'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {selectedParticipant?.nom} {selectedParticipant?.prenom}?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={loading.delete}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading.delete}
          >
            {loading.delete ? (
              <>
                <Spinner as="span" size="sm" animation="border" /> Deleting...
              </>
            ) : (
              'Delete Participant'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export default ParticipantsList;