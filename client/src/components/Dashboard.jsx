import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState(null); // Pour stocker les statistiques
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch(baseURI + 'api/dashboard', {
          method: 'GET',
          credentials: 'include' // Assurez-vous que le cookie est inclus dans la requête
        });

        if (response.ok) {
          const data = await response.text();
          setMessage(data); // Affichez le message dans le composant
        } else {
          navigate('/auth'); // Redirigez vers la page d'authentification en cas d'échec
        }
      } catch (error) {
        console.error('Error fetching dashboard message:', error);
        navigate('/auth'); // Redirigez en cas d'erreur
      }
    };

    fetchMessage();
  }, [navigate]);

  // Fonction pour gérer le clic sur le bouton "Statistiques"
  const handleStatsClick = async () => {
    try {
      const response = await fetch(baseURI + 'api/dashboard/stats', {
        method: 'GET',
        credentials: 'include' // Assurez-vous que le cookie est inclus dans la requête
      });

      if (response.ok) {
        const data = await response.json(); // Suppose que la réponse est en JSON
        setStats(data); // Mettez à jour l'état avec les statistiques
      } else {
        console.error('Error fetching statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };
  const handleClientManagement = () => {
    navigate('/clients');
  };
  return (
    <div>
      <p>{message}</p>
      <button onClick={handleClientManagement}>Gestion des clients</button>
      <button onClick={handleStatsClick}>Statistiques</button>
      {stats && (
        <div>
          <h2>Statistiques</h2>
          <pre>{JSON.stringify(stats, null, 2)}</pre> {/* Affiche les statistiques sous forme JSON */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
