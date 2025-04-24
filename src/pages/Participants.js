import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Alert,
  Modal, Spinner, Form
} from 'react-bootstrap';
import { api } from '../services/api';
import AddParticipant from './AddParticipant';
import { FaUserPlus, FaInfoCircle, FaTrashAlt, FaTimes, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ParticipantsList = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [formations, setFormations] = useState([]);
  const [profils, setProfils] = useState([]);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedFormationId, setSelectedFormationId] = useState('');
  const [loading, setLoading] = useState({
    participants: true,
    formations: false,
    profils: false,
    enroll: false,
    delete: false,
    update: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantsRes, formationsRes, profilsRes] = await Promise.all([
          api.get('/participants'),
          api.get('/formations'),
          api.get('/profils'),
        ]);
        setParticipants(participantsRes.data);
        setFormations(formationsRes.data);
        setProfils(profilsRes.data);
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

  const openEditModal = (participant) => {
    setSelectedParticipant(participant);
    setShowEditModal(true);
  };

  const handleEdit = async (updatedParticipant) => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      const res = await api.put(`/participants/${updatedParticipant.id}`, updatedParticipant);
      setParticipants(prev =>
        prev.map(p => (p.id === updatedParticipant.id ? res.data : p))
      );
      setShowEditModal(false);
    } catch (error) {
      setError('Error updating participant');
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };
  const [hoveredCardId, setHoveredCardId] = useState(null);

  return (
    <Container className="mt-4">
      <h1 className="mb-4" style={{ fontFamily: 'Segoe UI, sans-serif', fontWeight: '700', color: '#0d6efd' }}>
        Liste des Participants
      </h1>

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
    <Card
  className="shadow-sm h-100"
  style={{
    borderRadius: '16px',
    background: hoveredCardId === participant.id ? '#f1f9ff' : '#fdfdfd',
    border: '1px solid #dee2e6',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }}
  onClick={() => navigate(`/participants/${participant.id}`)}
  onMouseEnter={() => setHoveredCardId(participant.id)}
  onMouseLeave={() => setHoveredCardId(null)}
>

      <Card.Body>
        <Card.Title className="fw-bold mb-3">{participant.nom} {participant.prenom}</Card.Title>
        <Card.Text>
          <strong>Email:</strong> {participant.email || 'N/A'}<br />
          <strong>Téléphone:</strong> {participant.tel || 'N/A'}<br />
          <strong>Structure:</strong> {participant.structure || 'N/A'}<br />
          <strong>Profil:</strong> {participant.profil?.libelle || 'N/A'}<br />
          <strong>Formations:</strong> {participant.formations?.length || 0}
        </Card.Text>
        <div className="d-flex gap-2 justify-content-end mt-3">
          <Button variant="success" size="sm" onClick={(e) => { e.stopPropagation(); openEnrollModal(participant); }} title="Enroll">
            <FaUserPlus />
          </Button>
          <Button variant="warning" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(participant); }} title="Edit">
            <FaEdit />
          </Button>
          <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); openDeleteModal(participant); }} title="Delete">
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

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Ajouter un participant</Modal.Title></Modal.Header>
        <Modal.Body>
          <AddParticipant onParticipantAdded={handleParticipantAdded} onClose={() => setShowAddModal(false)} />
        </Modal.Body>
      </Modal>

      {/* Enroll Modal */}
      <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)}>
        <Modal.Header closeButton><Modal.Title>Inscrire {selectedParticipant?.nom} {selectedParticipant?.prenom}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Choisir une formation</Form.Label>
            <Form.Select value={selectedFormationId} onChange={(e) => setSelectedFormationId(e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {formations.map(f => (
                <option key={f.id} value={f.id}>{f.titre} ({formatDate(f.dateDebut)})</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEnrollModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleEnroll} disabled={!selectedFormationId || loading.enroll}>
            {loading.enroll ? <Spinner size="sm" animation="border" /> : 'Inscrire'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton><Modal.Title>Confirmer la suppression</Modal.Title></Modal.Header>
        <Modal.Body>Supprimer {selectedParticipant?.nom} {selectedParticipant?.prenom} ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading.delete}>
            {loading.delete ? <Spinner size="sm" animation="border" /> : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <EditParticipantModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        participant={selectedParticipant}
        profils={profils}
        onSave={handleEdit}
        loading={loading.update}
      />
    </Container>
  );
};

const EditParticipantModal = ({ show, onHide, participant, profils, onSave, loading }) => {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', tel: '', profilId: '' });

  useEffect(() => {
    if (participant) {
      setForm({
        nom: participant.nom,
        prenom: participant.prenom,
        email: participant.email,
        tel: participant.tel,
        profilId: participant.profil?.id || '',
      });
    }
  }, [participant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.nom || !form.prenom || !form.email || !form.profilId) return;
    onSave({
      ...participant,
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      tel: form.tel,
      profil: { id: form.profilId }
    });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton><Modal.Title>Modifier Participant</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Nom</Form.Label>
            <Form.Control name="nom" value={form.nom} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Prénom</Form.Label>
            <Form.Control name="prenom" value={form.prenom} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control name="email" value={form.email} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Téléphone</Form.Label>
            <Form.Control name="tel" value={form.tel} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Profil</Form.Label>
            <Form.Select name="profilId" value={form.profilId} onChange={handleChange}>
              <option value="">-- Choisir un profil --</option>
              {profils.map(p => (
                <option key={p.id} value={p.id}>{p.libelle}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Annuler</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Enregistrer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

export default ParticipantsList;
