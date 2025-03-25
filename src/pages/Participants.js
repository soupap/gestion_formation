import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';

const Participants = () => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/participants')
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
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Participants;