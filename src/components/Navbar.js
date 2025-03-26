import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const CustomNavbar = () => {
  const navigate = useNavigate(); // useNavigate hook for programmatic navigation

  const handleLogout = () => {
    localStorage.clear();  // Clear local storage
    navigate('/');         // Redirect to login page after logout
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Gestion de Formation</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/formations">Formations</Nav.Link>
            <Nav.Link as={Link} to="/participants">Participants</Nav.Link>
            {localStorage.getItem('role') !== 'admin' && (
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
