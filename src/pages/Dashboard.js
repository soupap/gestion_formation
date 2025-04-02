import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { api } from '../services/api'; // Import the api service

const Dashboard = () => {
  const [bestFormations, setBestFormations] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [budgetByYear, setBudgetByYear] = useState({});
  const [bestFormateur, setBestFormateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch all the statistics data using the api service
        const [bestFormationsResponse, totalBudgetResponse, budgetByYearResponse, bestFormateurResponse] = await Promise.all([
          api.get('/statistic/best-formations'),
          api.get('/statistic/total-budget'),
          api.get('/statistic/budget-by-year'),
          api.get('/statistic/best-formateur'),
        ]);

        // Set the data to the state
        setBestFormations(bestFormationsResponse.data);
        setTotalBudget(totalBudgetResponse.data);
        setBudgetByYear(budgetByYearResponse.data);
        setBestFormateur(bestFormateurResponse.data);
        setLoading(false);
      } catch (error) {
        setError("Erreur lors de la récupération des statistiques.");
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Container className="mt-4 d-flex justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1>Tableau de bord</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Best Formations */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Meilleures Formations</Card.Title>
              <Card.Text>
                {bestFormations.length > 0 ? (
                  <ul>
                    {bestFormations.map((formation) => (
                      <li key={formation.id}>{formation.titre} {formation.participants.length} Participant </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucune formation n'a été définie comme la meilleure.</p>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Budget */}
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Budget Total des Formations</Card.Title>
              <Card.Text>
                {totalBudget ? `${totalBudget} TND` : "Aucune donnée disponible."}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Budget By Year */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Budget Par Année</Card.Title>
              {Object.keys(budgetByYear).length > 0 ? (
                <ul>
                  {Object.entries(budgetByYear).map(([year, budget]) => (
                    <li key={year}>
                      {year}: {budget} TND
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune donnée de budget par année.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Best Formateur */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Meilleur Formateur</Card.Title>
              {bestFormateur ? (
                <Card.Text>{bestFormateur.nom} {bestFormateur.prenom}</Card.Text>
              ) : (
                <p>Aucun formateur n'a été désigné comme le meilleur.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
