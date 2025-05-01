import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Row, Col, Table, Badge, Modal } from 'react-bootstrap';
import { FaTrashAlt, FaArrowLeft, FaUserGraduate, FaEnvelope} from 'react-icons/fa';
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
    <Container className="mt-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button 
          variant="link" 
          className="text-secondary p-0" 
          onClick={() => navigate('/participants')}
        >
          <FaArrowLeft className="me-2" />
          Back to Participants
        </Button>
        <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)}>
          <FaTrashAlt className="me-2" />
          Delete Participant
        </Button>
      </div>

      <Card className="mb-4 participant-card">
        <Card.Header className="bg-primary  py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0 text-white">
              {participant?.nom} {participant?.prenom}
            </h3>
        
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          <Row>
            <Col md={6}>
              <div className="info-section">
                <h5 className="text-primary mb-3">
                  <FaUserGraduate className="me-2" />
                  Professional Information
                </h5>
                <div className="ps-4">
                  <p className="mb-3">
                    <strong>Profile:</strong>
                    <span className="ms-2">{participant?.profil?.libelle || 'N/A'}</span>
                  </p>
                  <p className="mb-3">
                    <strong>Structure:</strong>
                    <span className="ms-2">{participant?.structure || 'N/A'}</span>
                  </p>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="info-section">
                <h5 className="text-primary mb-3">
                  <FaEnvelope className="me-2" />
                  Contact Details
                </h5>
                <div className="ps-4">
                  <p className="mb-3">
                    <strong>Email:</strong>
                    <span className="ms-2">{participant?.email || 'N/A'}</span>
                  </p>
                  <p className="mb-3">
                    <strong>Phone:</strong>
                    <span className="ms-2">{participant?.tel || 'N/A'}</span>
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="formations-card">
        <Card.Header className="bg-light py-3">
          <h5 className="mb-0 text-primary">
            <FaUserGraduate className="me-2" />
            Enrolled Formations
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {participant?.formations && participant.formations.length > 0 ? (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th className="px-4">Title</th>
                  <th>Domain</th>
                  <th>Start Date</th>
                  <th>Duration</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {participant.formations.map((formation) => (
                  <tr key={formation.id}>
                    <td className="px-4 py-3">{formation.titre}</td>
                    <td className="py-3">{formation.domaine?.libelle || 'N/A'}</td>
                    <td className="py-3">{formatDate(formation.dateDebut)}</td>
                    <td className="py-3">{formation.duree} days</td>
                    <td className="text-center py-3">
                      <Badge 
                        bg={new Date(formation.dateFin) > new Date() ? 'success' : 'secondary'}
                        className="px-3 py-2"
                      >
                        {new Date(formation.dateFin) > new Date() ? 'Active' : 'Completed'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info" className="m-3">
              This participant is not enrolled in any formations yet.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-0">
            Are you sure you want to delete {participant?.nom} {participant?.prenom}?
            <br />
            <small className="text-muted">This action cannot be undone.</small>
          </p>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner as="span" size="sm" animation="border" className="me-2" />
                Deleting...
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