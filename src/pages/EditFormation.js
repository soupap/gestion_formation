import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { api } from '../services/api';

const EditFormation = ({ formationToEdit, onFormationUpdated, onClose }) => {
    const [formData, setFormData] = useState({
        titre: '',
        annee: new Date().getFullYear(),
        duree: 1,
        budget: 0,
        lieu: '',
        dateDebut: '',
        domaine: { id: '' },
        formateur: { id: '' },
        participant: [],
    });

    const [domaines, setDomaines] = useState([]);
    const [formateurs, setFormateurs] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDomaines();
        fetchFormateurs();
        if (formationToEdit) {
            const { titre, annee, duree, budget, lieu, dateDebut, domaine, formateur } = formationToEdit;
            setFormData({
                titre,
                annee,
                duree,
                budget,
                lieu,
                dateDebut: dateDebut ? new Date(dateDebut).toISOString().split('T')[0] : '',
                domaine: domaine ? { id: domaine.id } : { id: '' },
                formateur: formateur ? { id: formateur.id } : { id: '' },
                participant: formationToEdit.participant || [],
            });
        }
    }, [formationToEdit]);

    const fetchDomaines = async () => {
        try {
            const response = await api.get('/domaines');
            setDomaines(response.data);
        } catch (error) {
            setError('Error loading domaines');
        }
    };

    const fetchFormateurs = async () => {
        try {
            const response = await api.get('/formateurs');
            setFormateurs(response.data);
        } catch (error) {
            setError('Error loading formateurs');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                titre: formData.titre,
                annee: Number(formData.annee),
                duree: Number(formData.duree),
                budget: Number(formData.budget),
                lieu: formData.lieu,
                dateDebut: formData.dateDebut ? new Date(formData.dateDebut).toISOString() : null,
                domaine: { id: formData.domaine.id },
                formateur: { id: formData.formateur.id },
            };

            if (formationToEdit?.id) {
                await api.put(`/formations/${formationToEdit.id}`, payload);
                setSuccess('Formation updated successfully!');
                if (onFormationUpdated) onFormationUpdated();
            }

            setTimeout(() => onClose(), 2000);
        } catch (error) {
            setError('Error updating formation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Year</Form.Label>
                    <Form.Control
                        type="number"
                        value={formData.annee}
                        onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Row>
                        <Col>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                required
                            />
                        </Col>
                        <Col>
                            <Form.Label>Duration (days)</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                value={formData.duree}
                                onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                                required
                            />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Budget</Form.Label>
                    <Form.Control
                        type="number"
                        value={formData.budget}
                        min={0}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Row>
                        <Col>
                            <Form.Label>Domain</Form.Label>
                            <Form.Select
                                value={formData.domaine.id}
                                onChange={(e) => setFormData({ ...formData, domaine: { id: e.target.value } })}
                                required
                            >
                                <option value="">Select Domain</option>
                                {domaines.map((domaine) => (
                                    <option key={domaine.id} value={domaine.id}>{domaine.libelle}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Label>Trainer</Form.Label>
                            <Form.Select
                                value={formData.formateur.id}
                                onChange={(e) => setFormData({ ...formData, formateur: { id: e.target.value } })}
                                required
                            >
                                <option value="">Select Trainer</option>
                                {formateurs.map((formateur) => (
                                    <option key={formateur.id} value={formateur.id}>{formateur.nom}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                        type="text"
                        value={formData.lieu}
                        onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                        required
                    />
                </Form.Group>

                <Row className="m-3">
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Update Formation'}
                    </Button>
                </Row>
            </Form>
        </Container>
    );
};

export default EditFormation;
