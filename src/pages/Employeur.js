import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';
import { api } from '../services/api';

const Employeur = () => {
  const [employeurs, setemployeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/employeurs')
      .then(response => {
        setemployeurs(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des employeurs.");
        setLoading(false);
      });
  }, []);

  return (
    <Container className="mt-4">
      <h1>Liste des employeurs</h1>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
            </tr>
          </thead>
          <tbody>
            {employeurs.map(employeur => (
              <tr key={employeur.id}>
                <td>{employeur.id}</td>
                <td>{employeur.nomEmployeur}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Employeur;
