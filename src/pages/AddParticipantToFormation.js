import React from 'react';
import {
  Modal,
  Button,
  Spinner,
  ListGroup,
  Form
} from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';

const AddParticipantToFormationModal = ({
  show,
  onHide,
  formation,
  participants,
  loading,
  selectedIds,
  onToggle,
  onConfirm
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUserPlus className="me-2" />
          Ajouter des participants à {formation?.titre}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Chargement des participants...</p>
          </div>
        ) : (
          <>
            <p className="mb-3">Sélectionnez les participants à ajouter :</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <ListGroup variant="flush">
                {participants.length > 0 ? (
                  participants.map(participant => (
                    <ListGroup.Item key={participant.id}>
                      <Form.Check
                        type="checkbox"
                        id={`participant-${participant.id}`}
                        label={`${participant.nom} ${participant.prenom}`}
                        checked={selectedIds.includes(participant.id)}
                        onChange={() => onToggle(participant.id)}
                      />
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item className="text-muted">
                    Aucun participant disponible à ajouter.
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={!selectedIds.length}
        >
          Ajouter la sélection ({selectedIds.length})
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddParticipantToFormationModal;
