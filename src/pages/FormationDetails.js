import React, { useEffect, useState } from 'react';
import { 
  Container, Card, Alert, Spinner, Badge, 
  Row, Col, Table, Button, Modal 
} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import AddParticipantToFormationModal from './AddParticipantToFormation';

const FormationDetails = () => {
  const { id } = useParams();
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState({
    formation: true,
    participants: false,
    addParticipants: false,
    deleteParticipant: false
  });
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModalParticipant, setShowModalParticipant] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(prev => ({ ...prev, formation: true }));
      try {
        const response = await api.get(`/formations/${id}`);
        setFormation(response.data);
      } catch (error) {
        setError('Error loading formation details');
      } finally {
        setLoading(prev => ({ ...prev, formation: false }));
      }
    };

    fetchData();
  }, [id]);

  const fetchParticipants = async () => {
    setLoading(prev => ({ ...prev, participants: true }));
    try {
      const response = await api.get('/participants');
      const enrolledIds = formation?.participants?.map(p => p.id) || [];
      const availableParticipants = response.data.filter(
        participant => !enrolledIds.includes(participant.id)
      );
      setAllParticipants(availableParticipants);
    } catch (error) {
      setError('Error loading participants');
    } finally {
      setLoading(prev => ({ ...prev, participants: false }));
    }
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'PP', { locale: fr });
  };

  const handleDeleteParticipant = async () => {
    if (!participantToDelete) return;
    
    setLoading(prev => ({ ...prev, deleteParticipant: true }));
    try {
      // Following the same pattern as your working example
      await api.delete(`/participants/${participantToDelete.id}/formations/${id}`);
      
      // Update state to match the working pattern
      setFormation(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== participantToDelete.id)
      }));
      setShowDeleteModal(false);
    } catch (err) {
      setError("Erreur lors de la suppression du participant");
    } finally {
      setLoading(prev => ({ ...prev, deleteParticipant: false }));
    }
  };

  const handleAddParticipants = async () => {
    if (!selectedParticipantIds.length) {
      setError('Please select at least one participant');
      return;
    }

    setLoading(prev => ({ ...prev, addParticipants: true }));
    try {
      // Following the exact same pattern as your working example
      for (const participantId of selectedParticipantIds) {
        await api.put(`/participants/${participantId}/formations/${id}`);
      }

      // Update state to match the working pattern
      const addedParticipants = allParticipants.filter(p => 
        selectedParticipantIds.includes(p.id)
      );
      
      setFormation(prev => ({
        ...prev,
        participants: [...prev.participants, ...addedParticipants]
      }));
      
      setShowModalParticipant(false);
      setSelectedParticipantIds([]);
    } catch (error) {
      console.error('Error adding participants:', error);
      setError(error.response?.data?.message || 'Error adding participants');
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

  const confirmDelete = (participant) => {
    setParticipantToDelete(participant);
    setShowDeleteModal(true);
  };

  if (loading.formation) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="mt-4">{error}</Alert>;
  if (!formation) return <Alert variant="warning" className="mt-4">Formation non trouvée</Alert>;

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        <Card.Header as="h2" className="bg-primary text-white">
          {formation.titre}
          <Badge bg="secondary" className="ms-2">
            {formation.domaine.libelle}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          <Row>
            <Col md={6}>
              <Card.Text>
                <strong>Année:</strong> {formation.annee}
              </Card.Text>
              <Card.Text>
                <strong>Durée:</strong> {formation.duree} jours
              </Card.Text>
              <Card.Text>
                <strong>Budget:</strong> {formation.budget.toLocaleString('fr-FR')} TND
              </Card.Text>
              <Card.Text>
                <strong>Lieu:</strong> {formation.lieu}
              </Card.Text>
            </Col>
            
            <Col md={6}>
              <Card.Text>
                <strong>Date de début:</strong> {formatDate(formation.dateDebut)}
              </Card.Text>
              <Card.Text>
                <strong>Date de fin:</strong> {formatDate(formation.dateFin)}
              </Card.Text>
              <Card.Text>
                <strong>Statut:</strong> {new Date(formation.dateFin) > new Date() ? 
                  <Badge bg="success">En cours</Badge> : 
                  <Badge bg="secondary">Terminée</Badge>}
              </Card.Text>
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md={6}>
              <h4>Domaine</h4>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Text>
                    <strong>ID:</strong> {formation.domaine.id}
                  </Card.Text>
                  <Card.Text>
                    <strong>Nom:</strong> {formation.domaine.libelle}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <h4>Formateur</h4>
              <Card>
                <Card.Body>
                  <Card.Text>
                    <strong>Nom:</strong> {formation.formateur.nom} {formation.formateur.prenom}
                  </Card.Text>
                  <Card.Text>
                    <strong>Email:</strong> {formation.formateur.email}
                  </Card.Text>
                  <Card.Text>
                    <strong>Téléphone:</strong> {formation.formateur.tel}
                  </Card.Text>
                  <Card.Text>
                    <strong>Type:</strong> 
                    <Badge bg={formation.formateur.type === 'INTERNE' ? 'info' : 'warning'} className="ms-2">
                      {formation.formateur.type}
                    </Badge>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header as="h4" className="bg-light">
          Liste des Participants
          {["ADMINISTRATEUR", "UTILISATEUR"].includes(userRole) && (
            <Button 
              variant="success" 
              size="sm" 
              className="ms-3"
              onClick={() => {
                fetchParticipants();
                setShowModalParticipant(true);
              }}
            >
              Ajouter Participant
            </Button>
          )}
        </Card.Header>
        
        <Card.Body>
          {formation.participants.length === 0 ? (
            <Alert variant="info">Aucun participant inscrit à cette formation</Alert>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  {["ADMINISTRATEUR", "UTILISATEUR"].includes(userRole) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {formation.participants.map(participant => (
                  <tr key={participant.id}>
                    <td>{participant.id}</td>
                    <td>{participant.nom}</td>
                    <td>{participant.prenom}</td>
                    <td>{participant.email}</td>
                    <td>{participant.tel}</td>
                    {["ADMINISTRATEUR", "UTILISATEUR"].includes(userRole) && (
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => confirmDelete(participant)}
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
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer {participantToDelete?.nom} {participantToDelete?.prenom} de cette formation ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteParticipant}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Participants Modal */}
      <AddParticipantToFormationModal
        show={showModalParticipant}
        onHide={() => {
          setShowModalParticipant(false);
          setSelectedParticipantIds([]);
        }}
        formation={formation}
        participants={allParticipants}
        loading={loading.addParticipants || loading.participants}
        selectedIds={selectedParticipantIds}
        onToggle={toggleParticipantSelection}
        onConfirm={handleAddParticipants}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer {participantToDelete?.nom} {participantToDelete?.prenom} de cette formation ?
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={loading.deleteParticipant}
          >
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteParticipant}
            disabled={loading.deleteParticipant}
          >
            {loading.deleteParticipant ? (
              <>
                <Spinner as="span" size="sm" animation="border" /> Suppression...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FormationDetails;