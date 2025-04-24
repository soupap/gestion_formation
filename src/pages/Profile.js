import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Spinner, Alert, Container, Card, Badge, 
  Row, Col, Image, Button, Form, Modal 
} from 'react-bootstrap';
import { FaUserCircle, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validate form function
  const validateForm = () => {
    const errors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
    
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      } else if (!passwordRegex.test(formData.newPassword)) {
        errors.newPassword = 'Must contain uppercase, lowercase, number, and special character';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await api.put(`/utilisateurs/${user.id}`, {
        username: formData.username,
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setUser(response.data);
      setSuccessMessage('Profile updated successfully');
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (user && showEditModal) {
      setFormData({
        username: user.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setFormErrors({});
      setTouchedFields({});
    }
  }, [user, showEditModal]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/api/v1/auth/user-info');
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user information');
      }
    };
    fetchUserInfo();
  }, []);

  const getRoleVariant = (role) => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'danger';
      case 'RESPONSABLE': return 'warning';
      case 'UTILISATEUR': return 'secondary';
      default: return 'info';
    }
  };

  if (error) {
    return <Alert variant="danger" className="mt-4 text-center">{error}</Alert>;
  }

  if (!user) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="p-4 shadow-lg" style={{ maxWidth: '800px', width: '100%', borderRadius: '16px' }}>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}
        
        <Row className="align-items-center">
          <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
            {user?.photo ? (
              <Image src={user.photo} roundedCircle width={100} height={100} />
            ) : (
              <FaUserCircle size={100} color="#0d6efd" />
            )}
          </Col>

          <Col xs={12} md={8}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h4 className="fw-bold mb-2">{user?.username}</h4>
                <Badge bg={getRoleVariant(user?.role)} className="text-uppercase">
                  {user?.role}
                </Badge>
              </div>
              <Button variant="outline-primary" onClick={() => setShowEditModal(true)}>
                <FaEdit /> Edit Profile
              </Button>
            </div>
          </Col>
        </Row>

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Update Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  isInvalid={touchedFields.username && formErrors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    isInvalid={touchedFields.currentPassword && formErrors.currentPassword}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {formErrors.currentPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    isInvalid={touchedFields.newPassword && formErrors.newPassword}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Must contain uppercase, lowercase, number, and special character
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  {formErrors.newPassword}
                </Form.Control.Feedback>
              </Form.Group>

              {formData.newPassword && (
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      isInvalid={touchedFields.confirmPassword && formErrors.confirmPassword}
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card>
    </Container>
  );
};

export default Profile;