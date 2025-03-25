import React from 'react';
import { Container, Card } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Dashboard</Card.Title>
          <Card.Text>
            Bienvenue sur le tableau de bord de gestion de formation.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;