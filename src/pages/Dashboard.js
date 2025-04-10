import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { api } from '../services/api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {
  FaTrophy,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUsers,
  FaChartBar,
  FaChartPie
} from 'react-icons/fa';

Chart.register(...registerables);

const Dashboard = () => {
  const [stats, setStats] = useState({
    bestFormations: [],
    totalBudget: 0,
    budgetByYear: {},
    bestFormateur: null,
    participantsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [bestFormations, totalBudget, budgetByYear, bestFormateur, participants] = await Promise.all([
          api.get('/statistic/best-formations'),
          api.get('/statistic/total-budget'),
          api.get('/statistic/budget-by-year'),
          api.get('/statistic/best-formateur'),
          api.get('/statistic/total-participants')
        ]);

        setStats({
          bestFormations: bestFormations.data,
          totalBudget: totalBudget.data,
          budgetByYear: budgetByYear.data,
          bestFormateur: bestFormateur.data,
          participantsCount: participants.data
        });
        setLoading(false);
      } catch (error) {
        setError("Error loading dashboard statistics");
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const topFormationsChart = {
    labels: stats.bestFormations.map(f => f.titre),
    datasets: [{
      label: 'Participants',
      data: stats.bestFormations.map(f => f.participants.length),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 1
    }]
  };

  const yearlyBudgetChart = {
    labels: Object.keys(stats.budgetByYear),
    datasets: [{
      label: 'Budget (TND)',
      data: Object.values(stats.budgetByYear),
      fill: false,
      backgroundColor: '#36A2EB',
      borderColor: '#1E88E5',
      tension: 0.4
    }]
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4 d-flex align-items-center">
        <FaChartBar className="me-3 text-primary" />
        Dashboard Overview
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4 g-4">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaUsers size={24} className="text-primary" />
              </div>
              <h3>{stats.participantsCount}</h3>
              <p className="text-muted mb-0">Total Participants</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaMoneyBillWave size={24} className="text-success" />
              </div>
              <h3>{stats.totalBudget?.toLocaleString()} TND</h3>
              <p className="text-muted mb-0">Total Budget</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaChalkboardTeacher size={24} className="text-warning" />
              </div>
              <h3>{stats.bestFormations.length}</h3>
              <p className="text-muted mb-0">Active Formations</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaCalendarAlt size={24} className="text-info" />
              </div>
              <h3>{Object.keys(stats.budgetByYear).length}</h3>
              <p className="text-muted mb-0">Years Tracked</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaTrophy className="text-warning me-2" size={20} />
                <h5 className="mb-0">Top Formations by Participation</h5>
              </div>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={topFormationsChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaChartPie className="text-info me-2" size={20} />
                <h5 className="mb-0">Yearly Budget Allocation</h5>
              </div>
              <div style={{ height: '300px' }}>
                <Line 
                  data={yearlyBudgetChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaChalkboardTeacher className="text-danger me-2" size={20} />
                <h5 className="mb-0">Top Performing Formateur</h5>
              </div>
              {stats.bestFormateur ? (
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-4" style={{ width: '80px', height: '80px' }}>
                    <FaChalkboardTeacher size={32} className="text-muted" />
                  </div>
                  <div>
                    <h4 className="mb-1">{stats.bestFormateur.nom} {stats.bestFormateur.prenom}</h4>
                    <p className="text-muted mb-1">Email: {stats.bestFormateur.email}</p>
                    <p className="mb-0">
                      <span className="badge bg-primary">
                        {stats.bestFormateur.formationsCount || 0} formations
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No formateur data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
