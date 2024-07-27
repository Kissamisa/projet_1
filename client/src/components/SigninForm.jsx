import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate
import './SigninForm.css';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const SigninForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate(); // Initialiser useNavigate

  useEffect(() => {
    // Récupérer le token CSRF lorsque le composant est monté
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${baseURI}api/csrf-token`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } else {
          console.error('Erreur lors de la récupération du token CSRF');
        }
      } catch (error) {
        console.error('Erreur réseau lors de la récupération du token CSRF:', error);
      }
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
      const response = await fetch(`${baseURI}api/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken // Inclure le token CSRF dans les headers
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Inclure les cookies dans la requête
      });

      if (response.ok) {
        alert('Connexion réussie');
        navigate('/dashboard'); // Redirection vers la page du tableau de bord
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la connexion: ${errorData.message || 'Veuillez vérifier vos informations'}`);
      }
    } catch (error) {
      alert('Erreur réseau');
      console.error('Erreur réseau lors de la connexion:', error);
    }
  };

  return (
    <form className="signin-form" onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default SigninForm;
