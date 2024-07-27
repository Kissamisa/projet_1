import React, { useState, useEffect } from 'react';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const AjouterClient = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    voiture: ''
  });
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Obtenez le token CSRF au chargement du composant
    const fetchCsrfToken = async () => {
      const response = await fetch(baseURI + 'api/csrf-token', {
        credentials: 'include'
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    };

    fetchCsrfToken();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(baseURI + 'api/clients/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      if (response.ok) {
        alert('Client ajouté avec succès');
        // Réinitialisez le formulaire ou redirigez l'utilisateur si nécessaire
      } else {
        const errorText = await response.text();
        alert(`Erreur lors de l'ajout du client: ${errorText}`);
      }
    } catch (error) {
      alert('Erreur réseau: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Ajouter un Client</h2>
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
      <button type="submit">Ajouter</button>
    </form>
  );
};

export default AjouterClient;
