import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar, Nav, Container,
  Dropdown, Image, Spinner, Badge
} from 'react-bootstrap';
import { api } from '../services/api';
import {
  FaUserCircle,
  FaSignOutAlt,
  FaUserCog,
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaUsers,
  FaBook,
  FaBuilding,
  FaUserFriends
} from 'react-icons/fa';

const CustomNavbar = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/api/v1/auth/user-info');
        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'danger';
      case 'FORMATEUR': return 'primary';
      case 'UTILISATEUR': return 'secondary';
      default: return 'info';
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm py-2">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="text-primary fs-4 me-2">
            <FaBook />
          </span>
          <span className="fw-bold text-white">GestForm</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" className="border-white" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {userInfo?.role === 'RESPONSABLE' ? (
              <Nav.Link 
                as={Link} 
                to="/dashboard" 
                className="d-flex align-items-center text-white fw-bold fs-6 text-white "
              >
                <FaTachometerAlt className="me-1" />
                Dashboard
              </Nav.Link>
            ) : (
              <>
                {(userInfo?.role === 'ADMINISTRATEUR') &&
                  <Nav.Link 
                    as={Link} 
                    to="/dashboard" 
                    className="d-flex align-items-center text-white fw-bold fs-6 hover:text-white hover:opacity-90"
                  >
                    <FaTachometerAlt className="me-1" />
                    Dashboard
                  </Nav.Link>
                }
                <Nav.Link 
                  as={Link} 
                  to="/formations" 
                  className="d-flex align-items-center text-white fw-bold fs-6 hover:text-white hover:opacity-90"
                >
                  <FaBook className="me-1" />
                  Formations
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/formateur" 
                  className="d-flex align-items-center text-white fw-bold fs-6 hover:text-white hover:opacity-90"
                >
                  <FaChalkboardTeacher className="me-1" />
                  Formateurs
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/participants" 
                  className="d-flex align-items-center text-white fw-bold fs-6 hover:text-white hover:opacity-90"
                >
                  <FaUsers className="me-1" />
                  Participants
                </Nav.Link>
                {userInfo?.role !== 'UTILISATEUR' && (
                  <>
                    <Nav.Link 
                      as={Link} 
                      to="/domaine" 
                      className="d-flex align-items-center text-white fw-bold fs-6 hover:text-white hover:opacity-90"
                    >
                      <FaBook className="me-1" />
                      Domaines
                    </Nav.Link>
                    <Nav.Link 
                      as={Link} 
                      to="/employeur" 
                      className="d-flex align-items-center text-white fw-bold fs-6 hover:text-white hover:opacity-90"
                    >
                      <FaBuilding className="me-1" />
                      Employeurs
                    </Nav.Link>
                  </>
                )}
                {userInfo?.role === 'ADMINISTRATEUR' && (
                  <Nav.Link 
                    as={Link} 
                    to="/utilisateur" 
                    className="d-flex align-items-center text-white fw-bold fs-6 hover:text-white hover:opacity-90"
                  >
                    <FaUserFriends className="me-1" />
                    Utilisateurs
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          {loading ? (
            <Spinner animation="border" size="sm" variant="light" className="ms-auto" />
          ) : userInfo ? (
            <Dropdown align="end" className="ms-3">
              <Dropdown.Toggle
                variant="dark"
                id="user-dropdown"
                className="d-flex align-items-center text-white fw-bold"
              >
                {userInfo.photo ? (
                  <Image
                    src={userInfo.photo}
                    roundedCircle
                    width="32"
                    height="32"
                    className="me-2"
                  />
                ) : (
                  <FaUserCircle size={24} className="me-1 text-white" />
                )}
                <div className="d-none d-lg-inline">
                  <div className="small text-white">{userInfo.username}</div>
                  <Badge pill bg={getRoleVariant(userInfo.role)} className="text-uppercase">
                    {userInfo.role}
                  </Badge>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-menu-dark border-0 shadow">
                <Dropdown.Header className="text-center">
                  <div className="fw-bold text-white">{userInfo.username}</div>
                  <small className="text-white-50">{userInfo.email || ''}</small>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item 
                  as={Link} 
                  to="/profile" 
                  className="d-flex align-items-center text-white hover:bg-gray-800"
                >
                  <FaUserCog className="me-2" />
                  Mon Profil
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center text-danger hover:bg-gray-800"
                >
                  <FaSignOutAlt className="me-2" />
                  Déconnexion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav.Link as={Link} to="/login" className="btn btn-outline-light ms-2 fw-bold">
              Connexion
            </Nav.Link>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;