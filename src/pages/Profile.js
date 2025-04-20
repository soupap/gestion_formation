import React, { useEffect, useState } from 'react';

import { api } from '../services/api';
import { Spinner, Alert, Container, Card, Badge, Row, Col, Image } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/api/v1/auth/user-info');
        setUser(response.data);
      } catch (err) {
        setError('Impossible de charger les informations utilisateur.');
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
        <Row className="align-items-center">
          <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
            {user.photo ? (
              <Image
                src={user.photo}
                roundedCircle
                width={100}
                height={100}
                style={{ objectFit: 'cover', border: '3px solid #0d6efd' }}
              />
            ) : (
              <FaUserCircle size={100} color="#0d6efd" />
            )}
          </Col>

          <Col xs={12} md={8}>
            <h4 className="fw-bold mb-2">{user.username}</h4>
            <p className="text-muted mb-1"><strong>Email:</strong> {user.email || 'Non spécifié'}</p>
            <p className="mb-0">
              <strong>Rôle:</strong>{' '}
              <Badge bg={getRoleVariant(user.role)} className="text-uppercase">
                {user.role}
              </Badge>
            </p>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Profile;
