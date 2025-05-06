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
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import { api } from '../services/api';

const Formateurs = () => {
  const userRole = localStorage.getItem("role");
  const [formateurs, setFormateurs] = useState([]);
  const [employeurs, setEmployeurs] = useState([]);
  const [employeurId, setEmployeurId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [formateurToDelete, setFormateurToDelete] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [type, setType] = useState("INTERNE");

  useEffect(() => {
    fetchFormateurs();
    fetchEmployeurs();
  }, []);

  const fetchFormateurs = () => {
    setLoading(true);
    api.get('/formateurs')
      .then(response => {
        setFormateurs(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des formateurs.");
        setLoading(false);
      });
  };

  const fetchEmployeurs = () => {
    api.get('/employeurs')
      .then(response => {
        setEmployeurs(response.data);
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des employeurs.");
      });
  };

  // Filter formateurs by name
  const filteredFormateurs = formateurs.filter(formateur => 
    formateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFormateurs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFormateurs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteFormateur = (id) => {
    setFormateurToDelete(id);
    setDeleteModalShow(true);
  };

  const confirmDeleteFormateur = () => {
    api.delete(`/formateurs/${formateurToDelete}`)
      .then(() => {
        setFormateurs(formateurs.filter(f => f.id !== formateurToDelete));
        setDeleteError(null);
        setDeleteModalShow(false);
        setFormateurToDelete(null);
      })
      .catch(error => {
        const msg = error.response?.data?.message || "Erreur lors de la suppression du formateur.";
        setDeleteError(msg);
        setDeleteModalShow(false);
      });
  };

  const handleAddFormateur = () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || !tel.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    const newFormateur = {
      nom,
      prenom,
      email,
      tel,
      type,
      employeur: employeurId ? { id: Number(employeurId) } : null
    };

    api.post('/formateurs', newFormateur)
      .then(response => {
        setShowModal(false);
        resetForm();
        setError(null);
        fetchFormateurs();
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors de l'ajout du formateur.");
      });
  };

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setEmail("");
    setTel("");
    setType("INTERNE");
    setEmployeurId("");
  };
  
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
  
  const typeInterne = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '0.85rem'
  };
  
  const typeExterne = {
    backgroundColor: '#17a2b8',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '0.85rem'
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
                <h2 className="mb-0">Liste des Formateurs</h2>
                <p className="text-muted mb-0">Gestion des formateurs internes et externes</p>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="primary" 
                  onClick={() => setShowModal(true)}
                  style={addButtonStyle}
                  className="d-flex align-items-center"
                >
                  <span className="mr-1">+</span> Ajouter un Formateur
                </Button>
              </Col>
            </Row>
          </div>

          {deleteError && (
            <Alert variant="warning" onClose={() => setDeleteError(null)} dismissible>
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
                  placeholder="Rechercher par nom ou prénom"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
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
                        <th className="py-3">Prénom</th>
                        <th className="py-3">Email</th>
                        <th className="py-3">Téléphone</th>
                        <th className="py-3">Employeur</th>
                        <th className="py-3">Type</th>
                        {(userRole === "ADMINISTRATEUR" || userRole === "UTILISATEUR") && 
                          <th className="py-3 text-center">Actions</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map(formateur => (
                          <tr key={formateur.id}>
                            <td>{formateur.id}</td>
                            <td className="font-weight-bold">{formateur.nom}</td>
                            <td>{formateur.prenom}</td>
                            <td>
                              <a href={`mailto:${formateur.email}`} className="text-primary">
                                {formateur.email}
                              </a>
                            </td>
                            <td>{formateur.tel}</td>
                            <td>
                              {formateur.employeur?.nomEmployeur || 
                                <span className="text-muted">Non assigné</span>
                              }
                            </td>
                            <td>
                              <span style={formateur.type === "INTERNE" ? typeInterne : typeExterne}>
                                {formateur.type}
                              </span>
                            </td>
                            {(userRole === "ADMINISTRATEUR" || userRole === "UTILISATEUR") && (
                              <td className="text-center">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteFormateur(formateur.id)}
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
                          <td colSpan={(userRole === "ADMINISTRATEUR" || userRole === "UTILISATEUR") ? 8 : 7} className="text-center py-4">
                            <p className="text-muted mb-0">Aucun formateur trouvé</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredFormateurs.length > itemsPerPage && (
                  <div className="d-flex" style={paginationStyle}>
                    <Pagination>
                      <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                      <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <Pagination.Item 
                          key={number} 
                          active={number === currentPage}
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                      <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                )}
                
                <div className="text-muted text-center mt-3">
                  <small>Affichage de {currentItems.length} formateurs sur {filteredFormateurs.length} au total</small>
                </div>
              </>
            )}
          </div>
        </Card>
      </Container>

      {/* Modal for Adding Formateur */}
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
          <Modal.Title>Ajouter un Formateur</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddFormateur();
          }}
          required
        >
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Prénom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Téléphone"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <div className="d-flex">
                <Form.Check
                  type="radio"
                  label="Interne"
                  name="formationType"
                  id="typeInterne"
                  checked={type === "INTERNE"}
                  onChange={() => setType("INTERNE")}
                  className="me-3"
                />
                <Form.Check
                  type="radio"
                  label="Externe"
                  name="formationType"
                  id="typeExterne"
                  checked={type === "EXTERNE"}
                  onChange={() => setType("EXTERNE")}
                />
              </div>
            </Form.Group>
            
            {(type === "EXTERNE" && (
              <Form.Group className="mb-3">
                <Form.Label>Employeur</Form.Label>
                <Form.Select
                  value={employeurId}
                  onChange={(e) => setEmployeurId(e.target.value)}
                  className="form-control"
                >
                  <option value="">Sélectionner un employeur</option>
                  {employeurs.map(employeur => (
                    <option key={employeur.id} value={employeur.id}>
                      {employeur.nomEmployeur}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            ))}
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
              type="submit"
              style={{ background: 'linear-gradient(45deg, #007bff, #0056b3)', border: 'none' }}
            >
              Ajouter
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal for Deletion Confirmation */}
      <Modal
        show={deleteModalShow}
        onHide={() => setDeleteModalShow(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton style={{ borderBottom: '2px solid #f8f9fa' }}>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3" style={{ fontSize: '3rem', color: '#dc3545' }}>⚠️</div>
          <p>Êtes-vous sûr de vouloir supprimer ce formateur ?</p>
          <p className="text-muted small">Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '2px solid #f8f9fa' }}>
          <Button variant="light" onClick={() => setDeleteModalShow(false)}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteFormateur}
            style={{ background: 'linear-gradient(45deg, #dc3545, #c82333)', border: 'none' }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Formateurs;