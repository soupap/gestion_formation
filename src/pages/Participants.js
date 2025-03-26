import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../constants';

const Participants = () => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    axios.get(API_URL + '/participants')
      .then(response => setParticipants(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <Container className="mt-4">
      <h1>Liste des Participants</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Formations°</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(participant => (
            <tr key={participant.id}>
              <td>{participant.id}</td>
              <td>{participant.nom}</td>
              <td>{participant.prenom}</td>
              <td>{participant.email}</td>
              <td>{participant.tel}</td>
              <td>{participant.formations.length}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Participants;