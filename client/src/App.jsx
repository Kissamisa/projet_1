import HomePage from './components/HomePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ClientManagementPage from './components/ClientManagementPage';
import AjouterClient from './components/AjouterClient';
import ModifierClient from './components/ModifierClient';




import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientManagementPage />} />
          <Route path="/ajouter-client" element={<AjouterClient />} />
          <Route path="/modifier-client/:clientId" element={<ModifierClient />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;