import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const ModifierClient = () => {
  const { clientId } = useParams(); // Récupérer l'ID du client à partir des paramètres de l'URL
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    voiture: ''
  });
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
    const fetchClientData = async () => {
      try {
        const response = await fetch(`${baseURI}api/clients/${clientId}`, {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            nom: data.nom,
            prenom: data.prenom,
            age: data.age,
            voiture: data.voiture
          });
        } else {
          console.error('Error fetching client data');
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClientData();
  }, [clientId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseURI}api/clients/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ ...formData, clientId }),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Client modifié avec succès');
        navigate('/clients');
      } else {
        alert('Erreur lors de la modification du client');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Modifier le Client</h2>
      <input
        type="text"
        name="nom"
        placeholder="Nom"
        value={formData.nom}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="prenom"
        placeholder="Prénom"
        value={formData.prenom}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="age"
        placeholder="Âge"
        value={formData.age}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="voiture"
        placeholder="Voiture"
        value={formData.voiture}
        onChange={handleChange}
        required
      />
      <button type="submit">Modifier</button>
    </form>
  );
};

export default ModifierClient;
