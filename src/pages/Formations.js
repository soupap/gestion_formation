import React, { useState, useEffect } from 'react';
import {
  Container, Table, Alert, Spinner, Modal,
  Button, Badge, OverlayTrigger, Tooltip, Pagination
} from 'react-bootstrap';
import {
  FaUserPlus, FaTrashAlt, FaPen,
  FaPlus, FaCalendar, FaMoneyBillWave
} from 'react-icons/fa';

import AddFormation from './AddFormation';
import EditFormation from './EditFormation';
import AddParticipantToFormationModal from './AddParticipantToFormation';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Formations = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState({
    formations: true,
    participants: false,
    addParticipants: false,
    delete: false
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const formationsPerPage = 6;
  const totalPages = Math.ceil(formations.length / formationsPerPage);
  const paginatedFormations = formations.slice(
    (currentPage - 1) * formationsPerPage,
    currentPage * formationsPerPage
  );

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = () => {
    setLoading(prev => ({ ...prev, formations: true }));
    api.get('/formations')
      .then(response => {
        setFormations(response.data);
        setCurrentPage(1); // Reset page on new fetch
        setLoading(prev => ({ ...prev, formations: false }));
      })
      .catch((error) => {
        const apiError = error.response?.data;
        if (apiError && (apiError.error || apiError.message)) {
          setError(apiError.message);
        } else if (typeof apiError === 'string') {
          setError(apiError);
        } else {
          setError('Error loading formations');
        }
        setLoading(prev => ({ ...prev, formations: false }));
      });
  };

  const fetchParticipants = () => {
    setLoading(prev => ({ ...prev, participants: true }));
    api.get('/participants')
      .then(response => {
        const enrolledIds = selectedFormation?.participants?.map(p => p.id) || [];
        const availableParticipants = response.data.filter(
          participant => !enrolledIds.includes(participant.id)
        );
        setAllParticipants(availableParticipants);
        setLoading(prev => ({ ...prev, participants: false }));
      })
      .catch((error) => {
        const apiError = error.response?.data;
        setError(apiError?.message || 'Error loading participants');
        setLoading(prev => ({ ...prev, participants: false }));
      });
  };

  const handleAddParticipants = async () => {
    if (!selectedParticipantIds.length || !selectedFormation) {
      setError('Please select at least one participant');
      return;
    }
    setLoading(prev => ({ ...prev, addParticipants: true }));
    try {
      for (const participantId of selectedParticipantIds) {
        await api.put(`/participants/${participantId}/formations/${selectedFormation.id}`);
      }
      setShowAddParticipantModal(false);
      setSelectedParticipantIds([]);
      fetchFormations();
    } catch (error) {
      const apiError = error.response?.data;
      setError(apiError?.message || 'Error adding participants');
    } finally {
      setLoading(prev => ({ ...prev, addParticipants: false }));
    }
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

    setLoading(prev => ({ ...prev, delete: true }));
    api.delete(`/formations/${selectedFormation.id}`)
      .then(() => {
        setFormations(prev => prev.filter(f => f.id !== selectedFormation.id));
        setShowDeleteModal(false);
      })
      .catch(() => setError('Error deleting formation'))
      .finally(() => {
        setLoading(prev => ({ ...prev, delete: false }));
      });
  };

  const handleFormationAdded = () => {
    fetchFormations();
    setShowModal(false);
    setShowEditModal(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.Prev
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        />
        {[...Array(totalPages).keys()].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={currentPage === index + 1}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
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

      {loading.formations ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement en cours...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchFormations}>
            Réessayer
          </Button>
        </Alert>
      ) : (
        <>
          <Table bordered hover responsive>
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
              {paginatedFormations.map(formation => (
                <tr
                  className="shadow-sm h-100"
                  style={{
                    borderRadius: '16px',
                    border: '1px solid #dee2e6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  key={formation.id}
                  onClick={() => navigate(`/formations/${formation.id}`)}
                >
                  <td>
                    <strong>{formation.titre}</strong>
                    <div className="text-muted small">{formation.lieu}</div>
                  </td>
                  <td>
                    <div>{formatDate(formation.dateDebut)}</div>
                    <div className="text-muted small">au {formatDate(formation.dateFin)}</div>
                  </td>
                  <td className="text-center">
                    <Badge bg="info">{formation.duree} jours</Badge>
                  </td>
                  <td>{formation.domaine?.libelle || 'N/A'}</td>
                  <td>
                    {formation.formateur?.nom
                      ? `${formation.formateur.nom} ${formation.formateur.prenom}`
                      : 'N/A'}
                  </td>
                  <td className="text-end">
                    <FaMoneyBillWave className="me-2" />
                    {formation.budget?.toLocaleString('fr-FR')} TND
                  </td>
                  <td className="text-center">
                    <Badge bg="success">{formation.participants?.length || 0}</Badge>
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <OverlayTrigger overlay={<Tooltip>Add Participant</Tooltip>}>
                        <Button
                          variant="info"
                          size="sm"
                          className="p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFormation(formation);
                            fetchParticipants();
                            setShowAddParticipantModal(true);
                          }}
                          disabled={loading.participants}
                        >
                          {loading.participants ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FaUserPlus />
                          )}
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                        <Button
                          variant="light"
                          size="sm"
                          className="p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFormation(formation);
                            setShowEditModal(true);
                          }}
                          disabled={loading.participants}
                        >
                          <FaPen />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger overlay={<Tooltip>Delete Formation</Tooltip>}>
                        <Button
                          variant="danger"
                          size="sm"
                          className="p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            
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
          {renderPagination()}
        </>
      )}

      {/* Modals */}
      <AddParticipantToFormationModal
        show={showAddParticipantModal}
        onHide={() => {
          setShowAddParticipantModal(false);
          setSelectedParticipantIds([]);
        }}
        formation={selectedFormation}
        participants={allParticipants}
        loading={loading.participants || loading.addParticipants}
        selectedIds={selectedParticipantIds}
        onToggle={toggleParticipantSelection}
        onConfirm={handleAddParticipants}
      />

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedFormation?.titre}"?
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
            onClick={handleDeleteFormation}
            disabled={loading.delete}
          >
            {loading.delete ? <Spinner as="span" size="sm" animation="border" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPlus className="me-2" />
            edit formation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditFormation
            formationToEdit={selectedFormation}
            onFormationUpdated={handleFormationAdded}
            onClose={() => setShowEditModal(false)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Formations;
