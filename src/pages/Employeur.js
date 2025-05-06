import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Table, 
  Alert, 
  Spinner, 
  Button, 
  Modal, 
  Form, 
  Pagination, 
  InputGroup, 
  FormControl,
  Card,
  Row,
  Col,
  Badge
} from 'react-bootstrap';
import { api } from '../services/api';

const Employeur = () => {
  const userRole = localStorage.getItem("role");
  const [employeurs, setEmployeurs] = useState([]);
  const [filteredEmployeurs, setFilteredEmployeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Modal for add
  const [nomEmployeur, setNomEmployeur] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  // Modal for delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeurToDelete, setEmployeurToDelete] = useState(null);

  useEffect(() => {
    fetchEmployeurs();
  }, []);

  useEffect(() => {
    // Filter employeurs when search term changes
    const filtered = employeurs.filter(employeur =>
      employeur.nomEmployeur.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployeurs(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, employeurs]);

  const fetchEmployeurs = () => {
    setLoading(true);
    api.get('/employeurs')
      .then(response => {
        setEmployeurs(response.data);
        setFilteredEmployeurs(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des employeurs.");
        setLoading(false);
      });
  };

  const handleAddEmployeur = () => {
    if (!nomEmployeur.trim() || !adresse.trim() || !email.trim() || !telephone.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
  
    const newEmployeur = { nomEmployeur, adresse, email, telephone };
  
    api.post('/employeurs', newEmployeur)
      .then(response => {
        setEmployeurs([...employeurs, response.data]);
        setShowModal(false);
        resetForm();
        setError(null);
      })
      .catch(() => {
        setError("Erreur lors de l'ajout de l'employeur.");
      });
  };
  

  const handleDeleteConfirm = () => {
    if (!employeurToDelete) return;

    api.delete(`/employeurs/${employeurToDelete.id}`)
      .then(() => {
        const updatedEmployeurs = employeurs.filter(e => e.id !== employeurToDelete.id);
        setEmployeurs(updatedEmployeurs);
        setDeleteError(null);
        // Adjust current page if last item on page was deleted
        if (filteredEmployeurs.length % itemsPerPage === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      })
      .catch(error => {
        const msg = error.response?.data?.message || "Cet employeur ne peut pas être supprimé.";
        setDeleteError(msg);
      })
      .finally(() => {
        setShowDeleteModal(false);
        setEmployeurToDelete(null);
      });
  };

  const openDeleteModal = (employeur) => {
    setEmployeurToDelete(employeur);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setNomEmployeur("");
    setAdresse("");
    setEmail("");
    setTelephone("");
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployeurs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployeurs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Style objects
  const pageStyle = {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: '20px 0'
  };
  
  const cardStyle = {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    border: 'none'
  };
  
  const headerStyle = {
    borderBottom: '1px solid #e9ecef',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px 8px 0 0'
  };
  
  const tableContainerStyle = {
    padding: '20px'
  };
  
  const tableStyle = {
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    backgroundColor: '#fff'
  };

  const addButtonStyle = {
    background: 'linear-gradient(45deg, #007bff, #0056b3)',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '8px 16px'
  };
  
  const searchBarStyle = {
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #ced4da',
    borderRadius: '4px'
  };
  
  const paginationStyle = {
    justifyContent: 'center',
    marginTop: '20px'
  };

  return (
    <div style={pageStyle}>
      <Container>
        <Card style={cardStyle}>
          <div style={headerStyle}>
            <Row className="align-items-center">
              <Col>
                <h2 className="mb-0">Liste des Employeurs</h2>
                <p className="text-muted mb-0">Gestion des entreprises partenaires</p>
              </Col>
              {userRole === "ADMINISTRATEUR" && (
                <Col xs="auto">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowModal(true)}
                    style={addButtonStyle}
                    className="d-flex align-items-center"
                  >
                    <span className="mr-1">+</span> Ajouter un Employeur
                  </Button>
                </Col>
              )}
            </Row>
          </div>

          {deleteError && (
            <Alert variant="warning" onClose={() => setDeleteError(null)} dismissible className="m-3">
              {deleteError}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="m-3">
              {error}
            </Alert>
          )}

          <div style={tableContainerStyle}>
            <div className="mb-4">
              <InputGroup style={searchBarStyle}>
                <InputGroup.Text id="search-addon" style={{ background: 'transparent', border: 'none' }}>
                  🔍
                </InputGroup.Text>
                <FormControl
                  placeholder="Rechercher par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', boxShadow: 'none' }}
                />
              </InputGroup>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Chargement des données...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover style={tableStyle}>
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3">#</th>
                        <th className="py-3">Nom</th>
                        <th className="py-3">Adresse</th>
                        <th className="py-3">Contact</th>
                        {userRole === "ADMINISTRATEUR" && (
                          <th className="py-3 text-center">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map(employeur => (
                          <tr key={employeur.id}>
                            <td>{employeur.id}</td>
                            <td className="font-weight-bold">{employeur.nomEmployeur}</td>
                            <td>
                              {employeur.adresse || (
                                <span className="text-muted">Non renseignée</span>
                              )}
                            </td>
                            <td>
                              {employeur.email && (
                                <div>
                                  <i className="bi bi-envelope-fill text-primary me-1"></i>
                                  <a href={`mailto:${employeur.email}`} className="text-primary">
                                    {employeur.email}
                                  </a>
                                </div>
                              )}
                              {employeur.telephone && (
                                <div>
                                  <i className="bi bi-telephone-fill text-success me-1"></i>
                                  <span>{employeur.telephone}</span>
                                </div>
                              )}
                              {!employeur.email && !employeur.telephone && (
                                <span className="text-muted">Aucun contact</span>
                              )}
                            </td>
                            {userRole === "ADMINISTRATEUR" && (
                              <td className="text-center">
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  onClick={() => openDeleteModal(employeur)}
                                  className="rounded-pill"
                                >
                                  Supprimer
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={userRole === "ADMINISTRATEUR" ? 5 : 4} className="text-center py-4">
                            <p className="text-muted mb-0">Aucun employeur trouvé</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredEmployeurs.length > itemsPerPage && (
                  <div className="d-flex" style={paginationStyle}>
                    <Pagination>
                      <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev))} 
                        disabled={currentPage === 1}
                      />
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <Pagination.Item
                          key={number}
                          active={number === currentPage}
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next 
                        onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))} 
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                )}
                
                <div className="text-muted text-center mt-3">
                  <small>Affichage de {currentItems.length} employeurs sur {filteredEmployeurs.length} au total</small>
                </div>
              </>
            )}
          </div>
        </Card>
      </Container>

      {/* Modal for Adding Employer */}
      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          resetForm();
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ borderBottom: '2px solid #f8f9fa' }}>
          <Modal.Title>Ajouter un Employeur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Nom de l'employeur <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nom" 
                value={nomEmployeur} 
                onChange={(e) => setNomEmployeur(e.target.value)} 
                required
              />
              <Form.Text className="text-muted">
                Ce champ est obligatoire.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Adresse complète" 
                value={adresse} 
                onChange={(e) => setAdresse(e.target.value)} 
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'transparent' }}>
                      <i className="bi bi-envelope"></i>
                    </InputGroup.Text>
                    <Form.Control 
                      type="email" 
                      placeholder="contact@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'transparent' }}>
                      <i className="bi bi-telephone"></i>
                    </InputGroup.Text>
                    <Form.Control 
                      type="tel" 
                      placeholder="01 23 45 67 89" 
                      value={telephone} 
                      onChange={(e) => setTelephone(e.target.value)} 
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '2px solid #f8f9fa' }}>
          <Button 
            variant="light" 
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddEmployeur}
            style={{ background: 'linear-gradient(45deg, #007bff, #0056b3)', border: 'none' }}
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton style={{ borderBottom: '2px solid #f8f9fa' }}>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3" style={{ fontSize: '3rem', color: '#dc3545' }}>⚠️</div>
          <p>Êtes-vous sûr de vouloir supprimer l'employeur <strong>{employeurToDelete?.nomEmployeur}</strong> ?</p>
          <p className="text-muted small">Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '2px solid #f8f9fa' }}>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            style={{ background: 'linear-gradient(45deg, #dc3545, #c82333)', border: 'none' }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Employeur;