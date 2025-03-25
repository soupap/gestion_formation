import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';

const Formations = () => {
  const [formations, setFormations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/formations')
      .then(response => setFormations(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <Container className="mt-4">
      <h1>Liste des Formations</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Année</th>
            <th>Durée (jours)</th>
          </tr>
        </thead>
        <tbody>
          {formations.map(formation => (
            <tr key={formation.id}>
              <td>{formation.id}</td>
              <td>{formation.titre}</td>
              <td>{formation.annee}</td>
              <td>{formation.duree}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Formations;