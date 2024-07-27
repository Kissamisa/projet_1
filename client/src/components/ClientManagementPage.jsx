import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const ClientManagementPage = () => {
  const [clients, setClients] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(baseURI + 'api/csrf-token', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } else {
          console.error('Error fetching CSRF token');
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(baseURI + 'api/dashboard/clients', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          console.error('Error fetching client data');
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClients();
  }, []);

  const handleAddClient = () => {
    navigate('/ajouter-client');
  };

  const handleDelete = async (clientId) => {
    if (!clientId) {
      alert('Client ID est requis');
      return;
    }

    try {
      const response = await fetch(baseURI + 'api/clients/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ clientId }),
        credentials: 'include'
      });

      if (response.ok) {
        setClients(clients.filter(client => client.id !== clientId));
        alert('Client supprimé avec succès');
      } else {
        const errorMessage = await response.text();
        alert(`Erreur lors de la suppression du client: ${errorMessage}`);
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  const handleModifier = (clientId) => {
    navigate(`/modifier-client/${clientId}`);
  };

  return (
    <div>
      <h2>Liste des Clients</h2>
      <button onClick={handleAddClient}>Ajouter un client</button>
      <table>
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Âge</th>
            <th>Voiture</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <tr key={client.id}>
                <td>{client.nom}</td>
                <td>{client.prenom}</td>
                <td>{client.age}</td>
                <td>{client.voiture}</td>
                <td>
                  <button onClick={() => handleModifier(client.id)}>modifier</button>
                  <button onClick={() => handleDelete(client.id)}>supprimer</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Aucun client trouvé</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientManagementPage;
