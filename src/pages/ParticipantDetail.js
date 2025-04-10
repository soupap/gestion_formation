import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Row, Col, Table, Badge, Modal } from 'react-bootstrap';
import {  FaTrashAlt, FaArrowLeft, FaUserGraduate, FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';
import { api } from '../services/api';

const ParticipantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await api.get(`/participants/${id}?includeFormations=true`);
        setParticipant(response.data);
      } catch (error) {
        setError('Failed to load participant data');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [id]);


  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/participants/${id}`);
      navigate('/participants', { state: { message: 'Participant deleted successfully' } });
    } catch (error) {
      setError('Failed to delete participant');
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading participant data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
          <Button variant="outline-danger" className="ms-3" onClick={() => navigate('/participants')}>
            Back to list
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!participant) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Participant not found
          <Button variant="outline-warning" className="ms-3" onClick={() => navigate('/participants')}>
            Back to list
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/participants')}>
        <FaArrowLeft className="me-2" />
        Back to Participants
      </Button>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
          <h3 className="mb-0">
            {participant.nom} {participant.prenom}
          </h3>
          <div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              <FaTrashAlt className="me-1" />
              Delete
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <h5 className="text-muted">Personal Information</h5>
                <hr className="mt-1" />
                <p>
                  <FaUserGraduate className="me-2 text-primary" />
                  <strong>Profile:</strong> {participant.profil?.libelle || 'N/A'}
                </p>
                <p>
                  <FaBuilding className="me-2 text-primary" />
                  <strong>Structure:</strong> {participant.structure || 'N/A'}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <h5 className="text-muted">Contact Information</h5>
                <hr className="mt-1" />
                <p>
                  <FaEnvelope className="me-2 text-primary" />
                  <strong>Email:</strong> {participant.email || 'N/A'}
                </p>
                <p>
                  <FaPhone className="me-2 text-primary" />
                  <strong>Phone:</strong> {participant.tel || 'N/A'}
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="bg-light">
          <h5 className="mb-0">Enrolled Formations</h5>
        </Card.Header>
        <Card.Body>
          {participant.formations && participant.formations.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Domain</th>
                  <th>Start Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {participant.formations.map((formation) => (
                  <tr key={formation.id}>
                    <td>{formation.titre}</td>
                    <td>{formation.domaine?.libelle || 'N/A'}</td>
                    <td>{formatDate(formation.dateDebut)}</td>
                    <td>{formation.duree} days</td>
                    <td>
                      <Badge bg={new Date(formation.dateFin) > new Date() ? 'success' : 'secondary'}>
                        {new Date(formation.dateFin) > new Date() ? 'Active' : 'Completed'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">This participant is not enrolled in any formations yet.</Alert>
          )}
        </Card.Body>
      </Card>
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {participant.nom} {participant.prenom}?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
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

export default ParticipantDetail;