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
  Col
} from 'react-bootstrap';
import { api } from '../services/api';
import { FaPlus, FaTrash, FaTimes, FaSearch, FaFilter, FaSort } from 'react-icons/fa';

const Domaines = () => {
  const userRole = localStorage.getItem("role");
  const [domaines, setDomaines] = useState([]);
  const [filteredDomaines, setFilteredDomaines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");

  // New domaine fields
  const [libelle, setLibelle] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Modal for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [domaineToDelete, setDomaineToDelete] = useState(null);

  useEffect(() => {
    fetchDomaines();
  }, []);

  useEffect(() => {
    // Filter domaines when search term changes
    const filtered = domaines.filter(domaine =>
      domaine.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDomaines(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, domaines]);

  const fetchDomaines = () => {
    setLoading(true);
    api.get('/domaines')
      .then(response => {
        setDomaines(response.data);
        setFilteredDomaines(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des domaines.");
        setLoading(false);
      });
  };

  const handleAddDomaine = () => {
    if (!libelle.trim()) {
      setError("Le libellé est obligatoire.");
      return;
    }

    const newDomaine = { libelle };

    api.post('/domaines', newDomaine)
      .then(() => {
        setShowModal(false);
        setLibelle("");
        setError(null);
        setSuccessMessage("Domaine ajouté avec succès");
        fetchDomaines();
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(() => {
        setError("Erreur lors de l'ajout du domaine.");
      });
  };

  const handleDeleteDomaine = () => {
    if (!domaineToDelete) return;

    api.delete(`/domaines/${domaineToDelete.id}`)
      .then(() => {
        setDomaines(domaines.filter(d => d.id !== domaineToDelete.id));
        setDeleteError(null);
        setSuccessMessage("Domaine supprimé avec succès");
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Adjust current page if last item on page was deleted
        if (filteredDomaines.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      })
      .catch(error => {
        const msg = error.response?.data?.message || "Ce domaine ne peut pas être supprimé.";
        setDeleteError(msg);
      })
      .finally(() => {
        setShowDeleteModal(false);
        setDomaineToDelete(null);
      });
  };

  const openDeleteModal = (domaine) => {
    setDomaineToDelete(domaine);
    setShowDeleteModal(true);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDomaines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDomaines.length / itemsPerPage);

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
                <h2 className="mb-0">Liste des Domaines</h2>
                <p className="text-muted mb-0">Gestion des domaines de compétence</p>
              </Col>
              {userRole === "ADMINISTRATEUR" && (
                <Col xs="auto">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowModal(true)}
                    style={addButtonStyle}
                    className="d-flex align-items-center"
                  >
                    <span className="mr-1">+</span> Ajouter un Domaine
                  </Button>
                </Col>
              )}
            </Row>
          </div>

          {successMessage && (
            <Alert 
              variant="success" 
              onClose={() => setSuccessMessage(null)} 
              dismissible 
              className="m-3"
            >
              {successMessage}
            </Alert>
          )}

          {deleteError && (
            <Alert 
              variant="warning" 
              onClose={() => setDeleteError(null)} 
              dismissible 
              className="m-3"
            >
              {deleteError}
            </Alert>
          )}

          {error && (
            <Alert 
              variant="danger" 
              onClose={() => setError(null)} 
              dismissible 
              className="m-3"
            >
              {error}
            </Alert>
          )}

          <div style={tableContainerStyle}>
            <div className="mb-4">
              <InputGroup style={searchBarStyle}>
                <InputGroup.Text id="search-addon" style={{ background: 'transparent', border: 'none' }}>
                  <FaSearch color="#6c757d" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Rechercher un domaine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', boxShadow: 'none' }}
                />
              </InputGroup>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Chargement des domaines...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover style={tableStyle}>
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3">
                          <div className="d-flex align-items-center">
                            ID <FaSort className="ms-1" size={12} color="#6c757d" />
                          </div>
                        </th>
                        <th className="py-3">
                          <div className="d-flex align-items-center">
                            Libellé <FaSort className="ms-1" size={12} color="#6c757d" />
                          </div>
                        </th>
                        {userRole === "ADMINISTRATEUR" && (
                          <th className="py-3 text-center">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map(domaine => (
                          <tr key={domaine.id}>
                            <td>{domaine.id}</td>
                            <td className="font-weight-bold">{domaine.libelle || "Aucun libellé"}</td>
                            {userRole === "ADMINISTRATEUR" && (
                              <td className="text-center">
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  onClick={() => openDeleteModal(domaine)}
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
                          <td colSpan={userRole === "ADMINISTRATEUR" ? 3 : 2} className="text-center py-4">
                            {searchTerm ? (
                              <div className="text-muted">
                                <FaFilter className="me-2" />
                                Aucun domaine trouvé pour "{searchTerm}"
                              </div>
                            ) : (
                              <p className="text-muted mb-0">Aucun domaine disponible</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredDomaines.length > itemsPerPage && (
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
                  <small>
                    Affichage de {currentItems.length} domaines sur {filteredDomaines.length} au total
                    {searchTerm && ` (filtré par "${searchTerm}")`}
                  </small>
                </div>
              </>
            )}
          </div>
        </Card>
      </Container>

      {/* Modal for Adding Domaine */}
      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          setLibelle("");
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ borderBottom: '2px solid #f8f9fa' }}>
          <Modal.Title>Ajouter un Domaine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Libellé <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nom du domaine" 
                value={libelle} 
                onChange={(e) => setLibelle(e.target.value)} 
                required
              />
              <Form.Text className="text-muted">
                Ce champ est obligatoire.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '2px solid #f8f9fa' }}>
          <Button 
            variant="light" 
            onClick={() => {
              setShowModal(false);
              setLibelle("");
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddDomaine}
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
          <p>Êtes-vous sûr de vouloir supprimer le domaine <strong>{domaineToDelete?.libelle}</strong> ?</p>
          <p className="text-muted small">Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '2px solid #f8f9fa' }}>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteDomaine}
            style={{ background: 'linear-gradient(45deg, #dc3545, #c82333)', border: 'none' }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Domaines;