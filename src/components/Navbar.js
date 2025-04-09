import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const CustomNavbar = () => {
  const navigate = useNavigate(); // useNavigate hook for programmatic navigation

  const handleLogout = () => {
    localStorage.clear();  // Clear local storage
    navigate('/');         // Redirect to login page after logout
  };
  const isAdmin = localStorage.getItem('role') === 'ADMINISTRATEUR'; // Check if the user is an admin
  const isUser = localStorage.getItem('role') === 'UTILISATEUR'; // Check if the user is a formateur
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Gestion de Formation</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isUser && (
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            )}
            <Nav.Link as={Link} to="/formations">Formations</Nav.Link>
            <Nav.Link as={Link} to="/formateur">Formateur</Nav.Link>
            <Nav.Link as={Link} to="/participants">Participants</Nav.Link>
            <Nav.Link as={Link} to="/domaine">Domaine</Nav.Link>
            <Nav.Link as={Link} to="/employeur">Employeur</Nav.Link>
            {/* Only show this link if the user is an admin */}
            {isAdmin && (
              <Nav.Link as={Link} to="/utilisateur">Utilisateur</Nav.Link>
            )}
            <Nav.Link as="button" onClick={handleLogout}>Logout</Nav.Link> {/* Use Nav.Link and the onClick handler */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
