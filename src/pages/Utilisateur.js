import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import { API_URL } from '../constants';
import axios from 'axios';

const Utilisateurs = () => {
  const [Utilisateurs, setUtilisateurs] = useState([]);
  useEffect(() => {
    axios.get(API_URL + '/utilisateurs')
      .then(response => setUtilisateurs(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <Container className="mt-4">
      <h1>Liste des Utilisateurs</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Rôle</th>
            
          </tr>
        </thead>
        <tbody>
          {Utilisateurs.map(utilisateur => (
            <tr key={utilisateur.id}>
              <td>{utilisateur.id}</td>
              <td>{utilisateur.login}</td>
              <td>{utilisateur.role.nom}</td>

            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Utilisateurs;