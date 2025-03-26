import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../constants';
const Formations = () => {
  const [formations, setFormations] = useState([]);

  useEffect(() => {
    axios.get(API_URL+ '/formations')
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
            <th>Domaine</th>
            <th>Participant°</th>
            <th>Budget</th>
            
          </tr>
        </thead>
        <tbody>
          {formations.map(formation => (
            <tr key={formation.id}>
              <td>{formation.id}</td>
              <td>{formation.titre}</td>
              <td>{formation.annee}</td>
              <td>{formation.duree}</td>
              <td>{formation.domaine.libelle}</td>
              <td>{formation.participants.length}</td>
              <td>{formation.budget}</td>
              
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Formations;