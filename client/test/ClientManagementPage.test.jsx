import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ClientManagementPage from '../src/components/ClientManagementPage';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock des données de clients
const mockClients = [
  { id: 1, prenom: 'John', nom: 'Doe', age: 30, voiture: 'Toyota' },
  { id: 2, prenom: 'Jane', nom: 'Doe', age: 25, voiture: 'Honda' },
];

describe('ClientManagementPage', () => {
  it('renders the client management page', () => {
    render(
      <Router>
        <ClientManagementPage />
      </Router>
    );

    // Assurez-vous que la page est rendue en vérifiant un élément clé
    expect(screen.getByText('Liste des Clients')).toBeInTheDocument();
  });

  it('navigates to ajouter-client on add button click', () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);

    render(
      <Router>
        <ClientManagementPage />
      </Router>
    );

    const addButton = screen.getByText(/Ajouter un client/i); // Utiliser une expression régulière
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(navigate).toHaveBeenCalledWith('/ajouter-client');
  });

  it('displays client data in the table', () => {
    render(
      <Router>
        <ClientManagementPage clients={mockClients} />
      </Router>
    );

    // Assurez-vous que les données du client sont affichées
    expect(screen.getByText('Nom')).toBeInTheDocument();
  });

  it('calls delete function on delete button click', async () => {
    const mockDelete = vi.fn();
    render(
      <Router>
        <ClientManagementPage clients={mockClients} deleteClient={mockDelete} />
      </Router>
    );

    // Vérifiez que le bouton est présent avant de cliquer
    const deleteButtons = screen.getAllByText(/supprimer/i); // Utiliser une expression régulière
    expect(deleteButtons.length).toBeGreaterThan(0);

    fireEvent.click(deleteButtons[0]);
    // Ajout d'un petit délai pour que l'effet de la suppression se produise
    await new Promise((r) => setTimeout(r, 100));
    expect(mockDelete).toHaveBeenCalledWith(mockClients[0].id);
  });

  it('navigates to modifier-client on modify button click', () => {
    const navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);

    render(
      <Router>
        <ClientManagementPage clients={mockClients} />
      </Router>
    );

    // Vérifiez que le bouton est présent avant de cliquer
    const modifyButtons = screen.getAllByText(/modifier/i); // Utiliser une expression régulière
    expect(modifyButtons.length).toBeGreaterThan(0);

    fireEvent.click(modifyButtons[0]);
    expect(navigate).toHaveBeenCalledWith(`/modifier-client/${mockClients[0].id}`);
  });
});
