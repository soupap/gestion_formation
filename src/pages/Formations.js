import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Modal, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUserPlus, FaInfoCircle, FaTrashAlt, FaPlus, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';
import AddFormation from './AddFormation';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AddParticipantToFormationModal from './AddParticipantToFormation';


const Formations = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
  const [participantLoading, setParticipantLoading] = useState(false);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = () => {
    setLoading(true);
    api.get('/formations')
      .then(response => {
        setFormations(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error loading formations');
        setLoading(false);
      });
  };

  const fetchParticipants = (formationId) => {
    setParticipantLoading(true);
    api.get('/participants')
      .then(response => {
        // Get the list of already enrolled participant IDs
        const formation = formations.find(f => f.id === formationId);
        const enrolledIds = formation?.participants?.map(p => p.id) || [];
        
        // Filter out already enrolled participants
        const availableParticipants = response.data.filter(
          participant => !enrolledIds.includes(participant.id)
        );
        
        setAllParticipants(availableParticipants);
        setParticipantLoading(false);
      })
      .catch(() => {
        setError('Error loading participants');
        setParticipantLoading(false);
      });
  };

  const handleAddParticipants = () => {
    console.log('Selected Participants:', selectedParticipantIds);
    console.log('Selected Formation:', selectedFormation);
    //if (!selectedParticipantIds.length || !selectedFormation) return;
    api.post(`/formations/${selectedFormation.id}/add_participants`, selectedParticipantIds)
      .then(() => {
        fetchFormations();
        setShowAddParticipantModal(false);
        setSelectedParticipantIds([]);
      })
      .catch(() => setError('Error adding participants'));
  };

  const toggleParticipantSelection = (participantId) => {
    setSelectedParticipantIds(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleDeleteFormation = () => {
    if (!selectedFormation) return;

    api.delete(`/formations/${selectedFormation.id}`)
      .then(() => {
        setFormations(prev => prev.filter(f => f.id !== selectedFormation.id));
        setShowDeleteModal(false);
      })
      .catch(() => setError('Error deleting formation'));
  };

  const handleFormationAdded = () => {
    fetchFormations();
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <FaCalendar className="me-2" />
          Liste des Formations
        </h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Nouvelle Formation
        </Button>
      </div>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement en cours...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchFormations}>
            Réessayer
          </Button>
        </Alert>
      )}

      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Titre</th>
              <th>Dates</th>
              <th>Durée</th>
              <th>Domaine</th>
              <th>Formateur</th>
              <th className="text-end">Budget</th>
              <th>Participants</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {formations.map(formation => (
              <tr key={formation.id}>
                <td>
                  <strong>{formation.titre}</strong>
                  <div className="text-muted small">{formation.lieu}</div>
                </td>
                <td>
                  <div>{formatDate(formation.dateDebut)}</div>
                  <div className="text-muted small">
                    au {formatDate(formation.dateFin)}
                  </div>
                </td>
                <td className="text-center">
                  <Badge bg="info">{formation.duree} jours</Badge>
                </td>
                <td>{formation.domaine?.libelle || 'N/A'}</td>
                <td>
                  {formation.formateur?.nom ?
                    `${formation.formateur.nom} ${formation.formateur.prenom}` :
                    'N/A'}
                </td>
                <td className="text-end">
                  <FaMoneyBillWave className="me-2" />
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'TND'
                  }).format(formation.budget)}
                </td>
                <td className="text-center">
                  <Badge bg="success">
                    {formation.participants?.length || 0}
                  </Badge>
                </td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <OverlayTrigger overlay={<Tooltip>Add Participants</Tooltip>}>
                      <Button
                        variant="info"
                        size="sm"
                        className="p-2"
                        onClick={() => {
                          setSelectedFormation(formation);
                          fetchParticipants(formation.id);
                          setShowAddParticipantModal(true);
                        }}
                      >
                        <FaUserPlus />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger overlay={<Tooltip>Details</Tooltip>}>
                      <Button
                        variant="light"
                        size="sm"
                        className="p-2"
                        onClick={() => navigate(`/formations/${formation.id}`)}
                      >
                        <FaInfoCircle />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger overlay={<Tooltip>Delete Formation</Tooltip>}>
                      <Button
                        variant="danger"
                        size="sm"
                        className="p-2"
                        onClick={() => {
                          setSelectedFormation(formation);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrashAlt />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

    <AddParticipantToFormationModal
      show={showAddParticipantModal}
      onHide={() => {
        setShowAddParticipantModal(false);
        setSelectedParticipantIds([]);
      }}
      formation={selectedFormation}
      participants={allParticipants}
      loading={participantLoading}
      selectedIds={selectedParticipantIds}
      onToggle={toggleParticipantSelection}
      onConfirm={handleAddParticipants}
    />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedFormation?.titre}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteFormation}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Formation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            Créer une nouvelle formation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddFormation
            onFormationAdded={handleFormationAdded}
            onClose={() => setShowModal(false)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Formations;