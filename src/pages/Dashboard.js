import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { api } from '../services/api';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {
  FaTrophy,
  FaMoneyBillWave,
  FaChalkboardTeacher,
  FaUsers,
  FaChartBar,
  FaChartPie,
  FaBook,
  FaLayerGroup
} from 'react-icons/fa';

Chart.register(...registerables);

const Dashboard = () => {
  const [stats, setStats] = useState({
    bestFormations: [],
    totalBudget: 0,
    budgetByYear: {},
    bestFormateurs: [],
    participantsCount: 0,
    activeFormations: 0,
    totalFormations: 0,
    formationsByDomaine: {},
    topDomainsByBudget: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [
          bestFormations, 
          totalBudget, 
          budgetByYear, 
          bestFormateurs, 
          participants,
          activeFormations,
          totalFormations,
          formationsByDomaine,
          topDomainsByBudget
        ] = await Promise.all([
          api.get('/statistic/top-formations'),
          api.get('/statistic/total-budget'),
          api.get('/statistic/budget-by-year'),
          api.get('/statistic/top-formateurs'),
          api.get('/statistic/total-participants'),
          api.get('/statistic/active-formations'),
          api.get('/statistic/total-formations'),
          api.get('/statistic/formations-by-domaine'),
          api.get('/statistic/top-domains-by-budget')
        ]);

        setStats({
          bestFormations: bestFormations.data,
          totalBudget: totalBudget.data,
          budgetByYear: budgetByYear.data,
          bestFormateurs: bestFormateurs.data,
          participantsCount: participants.data,
          activeFormations: activeFormations.data,
          totalFormations: totalFormations.data,
          formationsByDomaine: formationsByDomaine.data,
          topDomainsByBudget: topDomainsByBudget.data
        });
        setLoading(false);
      } catch (error) {
        setError("Erreur lors du chargement des statistiques du tableau de bord");
        setLoading(false);
        console.error(error);
      }
    };

    fetchStatistics();
  }, []);

  // Charts data preparation
  const topFormationsChart = {
    labels: stats.bestFormations.map(f => f.titre),
    datasets: [{
      label: 'Participants',
      data: stats.bestFormations.map(f => f.participants?.length || 0),
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

  const formationsByDomaineChart = {
    labels: Object.keys(stats.formationsByDomaine),
    datasets: [{
      data: Object.values(stats.formationsByDomaine),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC24A', '#F06292'
      ],
      borderWidth: 1
    }]
  };

  const domainsByBudgetChart = {
    labels: stats.topDomainsByBudget.map(d => d.domaine),
    datasets: [{
      label: 'Budget (TND)',
      data: stats.topDomainsByBudget.map(d => d.totalBudget),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC24A', '#F06292'
      ],
      borderWidth: 1
    }]
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement du tableau de bord...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4 d-flex align-items-center">
        <FaChartBar className="me-3 text-primary" />
        Tableau de Bord du Centre de Formation
      </h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Summary Cards */}
      <Row className="mb-4 g-4">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaUsers size={24} className="text-primary" />
              </div>
              <h3>{stats.participantsCount}</h3>
              <p className="text-muted mb-0">Nombre Total de Participants</p>
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
              <p className="text-muted mb-0">Budget Total</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaLayerGroup size={24} className="text-warning" />
              </div>
              <h3>{stats.totalFormations}</h3>
              <p className="text-muted mb-0">Nombre Total de Formations</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <FaBook size={24} className="text-info" />
              </div>
              <h3>{stats.activeFormations}</h3>
              <p className="text-muted mb-0">Formations Actives</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaTrophy className="text-warning me-2" size={20} />
                <h5 className="mb-0">Formations les Plus Populaires</h5>
              </div>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={topFormationsChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.parsed.y} participants`;
                          }
                        }
                      }
                    },
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
                <h5 className="mb-0">Répartition Annuelle du Budget</h5>
              </div>
              <div style={{ height: '300px' }}>
                <Line 
                  data={yearlyBudgetChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: true, position: 'top' },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.parsed.y.toLocaleString()} TND`;
                          }
                        }
                      }
                    },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

{/* Charts Row 2 - Flipped Chart Types */}
<Row className="g-4 mb-4">
  <Col lg={6}>
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <FaChartPie className="text-danger me-2" size={20} />
          <h5 className="mb-0">Formations par Domaine</h5>
        </div>
        <div style={{ height: '300px' }}>
          <Bar 
            data={formationsByDomaineChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: ${context.parsed.y} formations`;
                    }
                  }
                }
              },
              scales: { 
                y: { 
                  beginAtZero: true,
                  ticks: {
                    precision: 0 // Show whole numbers only
                  }
                } 
              }
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
          <FaMoneyBillWave className="text-success me-2" size={20} />
          <h5 className="mb-0">Domaines Principaux par Budget</h5>
        </div>
        <div style={{ height: '300px' }}>
          <Pie 
            data={domainsByBudgetChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { position: 'right' },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: ${context.raw.toLocaleString()} TND`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>

{/* Top Formateurs Section */}
<Row className="mb-4">
  <Col>
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <FaChalkboardTeacher className="text-danger me-2" size={20} />
          <h5 className="mb-0"> Formateurs les Plus Performants</h5>
        </div>
        
        {stats.bestFormateurs && Object.keys(stats.bestFormateurs).length > 0 ? (
          <div>
            {/* Convert the object to array of entries, sort by count, and take top 3 */}
            {Object.entries(stats.bestFormateurs)
              .sort(([,a], [,b]) => b - a) // Sort by count descending
              .slice(0, 3) // Take top 3
              .map(([formateurStr, count], index) => {
                // Parse the formateur string to extract details
                const formateurMatch = formateurStr.match(/Formateur\(id=(\d+), nom=([^,]+), prenom=([^,]+), email=([^,]+)/);
                if (!formateurMatch) return null;
                
                const [, id, nom, prenom, email] = formateurMatch;
                
                return (
                  <div key={id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <div className="position-relative me-5">
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: '60px', height: '60px' }}>
                        <FaChalkboardTeacher size={24} className="text-muted" />
                      </div>
                      {index === 0 && (
                        <div className="position-absolute top-0 start-100 translate-middle">
                          <span className="badge rounded-pill bg-warning text-dark">
                            <FaTrophy className="me-1" /> #1
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div> 
                      <h5 className="mb-1">
                        {index + 1}. {nom} {prenom}
                      </h5>
                      <p className="text-muted mb-1 small">Email: {email}</p>
                      <p className="mb-0">
                        <span className="badge bg-primary">
                          {count} formations conducted
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            }
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