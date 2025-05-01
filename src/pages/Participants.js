import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Alert,
  Modal, Spinner, Form, Badge
} from 'react-bootstrap';
import { api } from '../services/api';
import AddParticipant from './AddParticipant';
import { FaUserPlus, FaInfoCircle, FaTrashAlt, FaTimes, FaEdit, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ParticipantsList = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [formations, setFormations] = useState([]);
  const [profils, setProfils] = useState([]);
  const [alert, setAlert] = useState({ message: null, type: 'danger' });
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
  const [hoveredCardId, setHoveredCardId] = useState(null);

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
        setAlert({ message: 'Error loading data', type: 'danger' });
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
      setAlert({ message: 'Participant inscrit avec succès', type: 'success' });
      setTimeout(() => setAlert({ message: null, type: 'danger' }), 4000);
    } catch (error) {
      setAlert({ message: "Erreur lors de l'inscription du participant", type: 'danger' });
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
      setAlert({ message: 'Error deleting participant', type: 'danger' });
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
      setAlert({ message: 'Error updating participant', type: 'danger' });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  return (
    <Container className="mt-4">
      <h1 
        className="mb-4" 
        style={{ 
          fontFamily: 'Segoe UI, sans-serif', 
          fontWeight: '700', 
          color: '#0d6efd',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        Liste des Participants
      </h1>

      {alert.message && (
        <Alert variant={alert.type} className="d-flex justify-content-between align-items-center">
          <span>{alert.message}</span>
          <Button variant={`outline-${alert.type}`} size="sm" onClick={() => setAlert({ message: null, type: 'danger' })}>
            <FaTimes />
          </Button>
        </Alert>
      )}

      <div className="d-flex justify-content-between mb-4">
        <Button 
          variant="primary" 
          onClick={() => setShowAddModal(true)}
          style={{
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Ajouter un participant
        </Button>
      </div>

      {loading.participants ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Chargement des participants...</p>
        </div>
      ) : participants.length > 0 ? (
        <Row>
          {participants.map((participant) => (
            <Col key={participant.id} md={4} className="mb-3">
              <Card
                className="shadow-sm h-100"
                style={{
                  borderRadius: '16px',
                  background: hoveredCardId === participant.id ? '#f8f9fa' : '#ffffff',
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: hoveredCardId === participant.id ? 'translateY(-2px)' : 'none',
                  boxShadow: hoveredCardId === participant.id ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onClick={() => navigate(`/participants/${participant.id}`)}
                onMouseEnter={() => setHoveredCardId(participant.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <Card.Body>
                  <Card.Title 
                    className="mb-3" 
                    style={{
                      fontFamily: 'Segoe UI, sans-serif',
                      fontWeight: '600',
                      fontSize: '1.25rem',
                      color: '#2c3e50',
                      borderBottom: '1px solid #eee',
                      paddingBottom: '0.5rem'
                    }}
                  >
                    {participant.nom} {participant.prenom}
                    <Badge 
                      bg="info" 
                      className="ms-2" 
                      style={{ 
                        fontSize: '0.75rem',
                        fontWeight: 'normal'
                      }}
                    >
                      {participant.profil?.libelle || 'N/A'}
                    </Badge>
                  </Card.Title>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '24px',
                        color: '#6c757d'
                      }}>
                        ✉️
                      </span>
                      <span style={{ marginLeft: '0.5rem' }}>
                        {participant.email || 'N/A'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '24px',
                        color: '#6c757d'
                      }}>
                        📞
                      </span>
                      <span style={{ marginLeft: '0.5rem' }}>
                        {participant.tel || 'N/A'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '24px',
                        color: '#6c757d'
                      }}>
                        🏢
                      </span>
                      <span style={{ marginLeft: '0.5rem' }}>
                        {participant.structure || 'N/A'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '24px',
                        color: '#6c757d'
                      }}>
                        <FaGraduationCap />
                      </span>
                      <span style={{ marginLeft: '0.5rem' }}>
                        Formations: <Badge bg="success">{participant.formations?.length || 0}</Badge>
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end mt-3">
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); openEnrollModal(participant); }} 
                      title="Enroll"
                      style={{ minWidth: '34px' }}
                    >
                      <FaUserPlus />
                    </Button>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); openEditModal(participant); }} 
                      title="Edit"
                      style={{ minWidth: '34px' }}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); openDeleteModal(participant); }} 
                      title="Delete"
                      style={{ minWidth: '34px' }}
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
        <Alert variant="info" style={{ borderRadius: '10px' }}>
          Aucun participant trouvé.
        </Alert>
      )}

      {/* Add Modal */}
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

      {/* Enroll Modal */}
      <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Inscrire {selectedParticipant?.nom} {selectedParticipant?.prenom}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Choisir une formation</Form.Label>
            <Form.Select 
              value={selectedFormationId} 
              onChange={(e) => setSelectedFormationId(e.target.value)}
              style={{ borderRadius: '8px' }}
            >
              <option value="">-- Sélectionner --</option>
              {formations
                .filter(f =>
                  !selectedParticipant?.formations?.some(pf => pf.id === f.id)
                )
                .map(f => (
                  <option key={f.id} value={f.id}>
                    {f.titre} ({formatDate(f.dateDebut)})
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowEnrollModal(false)}
            style={{ borderRadius: '8px' }}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEnroll} 
            disabled={!selectedFormationId || loading.enroll}
            style={{ borderRadius: '8px' }}
          >
            {loading.enroll ? <Spinner size="sm" animation="border" /> : 'Inscrire'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer {selectedParticipant?.nom} {selectedParticipant?.prenom} ?
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            style={{ borderRadius: '8px' }}
          >
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            disabled={loading.delete}
            style={{ borderRadius: '8px' }}
          >
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
      <Modal.Header closeButton>
        <Modal.Title>Modifier Participant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control 
              name="nom" 
              value={form.nom} 
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control 
              name="prenom" 
              value={form.prenom} 
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              name="email" 
              value={form.email} 
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control 
              name="tel" 
              value={form.tel} 
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Profil</Form.Label>
            <Form.Select 
              name="profilId" 
              value={form.profilId} 
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
            >
              <option value="">-- Choisir un profil --</option>
              {profils.map(p => (
                <option key={p.id} value={p.id}>{p.libelle}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          style={{ borderRadius: '8px' }}
        >
          Annuler
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading}
          style={{ borderRadius: '8px' }}
        >
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