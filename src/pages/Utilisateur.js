import React, { useEffect, useState } from 'react';
import {
  Container, Table, Alert, Spinner,
  ButtonGroup, Button, Toast, ToastContainer,
  Modal, Form, InputGroup, FormControl, Card,
  Row, Col, Pagination
} from 'react-bootstrap';
import { api } from '../services/api';

const Utilisateurs = () => {
  const currentUserId = parseInt(localStorage.getItem("userId") || "0");
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  
  // Add new state variables for user creation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "UTILISATEUR"
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  useEffect(() => {
    // Filter users when search term changes
    const filtered = utilisateurs.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUtilisateurs(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, utilisateurs]);

  const fetchUtilisateurs = () => {
    setLoading(true);
    api.get('/utilisateurs')
      .then(response => {
        setUtilisateurs(response.data);
        setFilteredUtilisateurs(response.data);
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err.response?.data;
        if (apiError && (apiError.error || apiError.message)) {
          setError(`${apiError.error ? apiError.error + ': ' : ''}${apiError.message || ''}`.trim());
        } else if (typeof apiError === 'string') {
          setError(apiError);
        } else {
          setError("Erreur lors du chargement des utilisateurs.");
        }
        console.error("Fetch users error:", apiError || err.message);
        setLoading(false);
      });
  };

  const updateUserRole = async (userId, newRole) => {
    // Prevent admin from changing their own role
    if (userId === currentUserId) {
      setToastType('danger');
      setToastMessage("Vous ne pouvez pas modifier votre propre rôle");
      setShowToast(true);
      return;
    }
    
    try {
      const response = await api.post(`/utilisateurs/updateRole/${userId}/${newRole}`);
      if (response.status === 200) {
        setUtilisateurs(prev => prev.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ));
        setToastType('success');
        setToastMessage(`Rôle mis à jour avec succès pour l'utilisateur ${userId}`);
        setShowToast(true);
      } else {
        throw new Error(response.data?.message || "Réponse inattendue du serveur");
      }
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError && (apiError.error || apiError.message)) {
        setToastType('danger');
        setToastMessage(`${apiError.error ? apiError.error + ': ' : ''}${apiError.message || ''}`.trim());
      } else if (typeof apiError === 'string') {
        setToastType('danger');
        setToastMessage(apiError);
      } else {
        setToastType('danger');
        setToastMessage("Erreur lors de la mise à jour du rôle");
      }
      setShowToast(true);
    }
  };

  const handleDeleteClick = (user) => {
    // Prevent admin from deleting themselves
    if (user.id === currentUserId) {
      setToastType('danger');
      setToastMessage("Vous ne pouvez pas supprimer votre propre compte");
      setShowToast(true);
      return;
    }
    
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/utilisateurs/${userToDelete.id}`);
      setUtilisateurs(prev => prev.filter(u => u.id !== userToDelete.id));
      setToastType('success');
      setToastMessage(`Utilisateur ${userToDelete.username} supprimé avec succès`);
      setShowToast(true);
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError && (apiError.error || apiError.message)) {
        setToastType('danger');
        setToastMessage(`${apiError.error ? apiError.error + ': ' : ''}${apiError.message || ''}`.trim());
      } else if (typeof apiError === 'string') {
        setToastType('danger');
        setToastMessage(apiError);
      } else {
        setToastType('danger');
        setToastMessage("Erreur lors de la suppression de l'utilisateur");
      }
      setShowToast(true);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      setToastType('danger');
      setToastMessage("Le nom d'utilisateur et le mot de passe sont obligatoires.");
      setShowToast(true);
      return;
    }

    try {
      const response = await api.post('/utilisateurs', newUser);
      setUtilisateurs([...utilisateurs, response.data]);
      setToastType('success');
      setToastMessage("Utilisateur créé avec succès!");
      setShowToast(true);
      setShowAddModal(false);
      setNewUser({ username: "", password: "", role: "UTILISATEUR" });
    } catch (error) {
      const apiError = error.response?.data;
      setToastType('danger');
      setToastMessage(apiError?.message || "Erreur lors de la création de l'utilisateur");
      setShowToast(true);
    }
  };

  const getRoleVariant = (role) => {
    const variants = {
      ADMINISTRATEUR: 'danger',
      RESPONSABLE: 'warning',
      UTILISATEUR: 'primary'
    };
    return variants[role] || 'secondary';
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUtilisateurs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUtilisateurs.length / itemsPerPage);

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
                <h2 className="mb-0">Liste des Utilisateurs</h2>
                <p className="text-muted mb-0">Gestion des comptes et des permissions</p>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddModal(true)}
                  style={addButtonStyle}
                  className="d-flex align-items-center"
                >
                  <span className="mr-1">+</span> Ajouter un Utilisateur
                </Button>
              </Col>
            </Row>
          </div>

          {/* Toast for success or error */}
          <ToastContainer position="top-end" className="p-3">
            <Toast
              show={showToast || !!error}
              onClose={() => {
                setShowToast(false);
                setError(null);
              }}
              delay={3000}
              autohide
              bg={toastType === 'danger' ? 'danger' : 'success'}
            >
              <Toast.Header>
                <strong className="me-auto">{toastType === 'danger' ? "Erreur" : "Succès"}</strong>
              </Toast.Header>
              <Toast.Body className="text-white">{toastMessage}</Toast.Body>
            </Toast>
          </ToastContainer>

          <div style={tableContainerStyle}>
            <div className="mb-4">
              <InputGroup style={searchBarStyle}>
                <InputGroup.Text id="search-addon" style={{ background: 'transparent', border: 'none' }}>
                  🔍
                </InputGroup.Text>
                <FormControl
                  placeholder="Rechercher par nom d'utilisateur..."
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
                        <th className="py-3">ID</th>
                        <th className="py-3">Nom d'utilisateur</th>
                        <th className="py-3">Rôle actuel</th>
                        <th className="py-3 text-center">Modifier le rôle</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td className="font-weight-bold">
                              {user.username}
                              {user.id === currentUserId && (
                                <span className="ml-2 badge bg-info text-white">Vous</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge bg-${getRoleVariant(user.role)} text-white`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="text-center">
                              <ButtonGroup size="sm">
                                {["UTILISATEUR", "RESPONSABLE", "ADMINISTRATEUR"].map(role => (
                                  <Button
                                    key={role}
                                    variant={user.role === role ? getRoleVariant(role) : 'outline-secondary'}
                                    disabled={
                                      user.role === role || 
                                      user.id === currentUserId || 
                                      user.role === "ADMINISTRATEUR"
                                    }
                                    onClick={() => updateUserRole(user.id, role)}
                                    className="text-nowrap"
                                    title={
                                      user.id === currentUserId
                                        ? "Vous ne pouvez pas modifier votre propre rôle"
                                        : user.role === "ADMINISTRATEUR"
                                          ? "Impossible de modifier le rôle d'un administrateur"
                                          : ""
                                    }
                                  >
                                    {role}
                                  </Button>
                                ))}
                              </ButtonGroup>
                            </td>
                            <td className="text-center">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                                disabled={user.role === "ADMINISTRATEUR" || user.id === currentUserId}
                                title={
                                  user.id === currentUserId 
                                    ? "Vous ne pouvez pas supprimer votre propre compte"
                                    : user.role === "ADMINISTRATEUR"
                                      ? "Impossible de supprimer un administrateur"
                                      : "Supprimer l'utilisateur"
                                }
                                className="rounded-pill"
                              >
                                Supprimer
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            <p className="text-muted mb-0">Aucun utilisateur trouvé</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredUtilisateurs.length > itemsPerPage && (
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
                  <small>Affichage de {currentItems.length} utilisateurs sur {filteredUtilisateurs.length} au total</small>
                </div>
              </>
            )}
          </div>
        </Card>
      </Container>

      {/* Delete confirmation modal */}
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
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.username}</strong> ?</p>
          <p className="text-muted small">Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '2px solid #f8f9fa' }}>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            style={{ background: 'linear-gradient(45deg, #dc3545, #c82333)', border: 'none' }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add user modal */}
      <Modal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ borderBottom: '2px solid #f8f9fa' }}>
          <Modal.Title>Ajouter un utilisateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom d'utilisateur"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Ce champ est obligatoire.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe <span className="text-danger">*</span></Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez le mot de passe"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
                <Button 
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Ce champ est obligatoire.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Rôle</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="UTILISATEUR">UTILISATEUR</option>
                <option value="RESPONSABLE">RESPONSABLE</option>
                <option value="ADMINISTRATEUR">ADMINISTRATEUR</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '2px solid #f8f9fa' }}>
          <Button 
            variant="light" 
            onClick={() => {
              setShowAddModal(false);
              setNewUser({ username: "", password: "", role: "UTILISATEUR" });
              setShowPassword(false);
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddUser}
            style={{ background: 'linear-gradient(45deg, #007bff, #0056b3)', border: 'none' }}
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Utilisateurs;