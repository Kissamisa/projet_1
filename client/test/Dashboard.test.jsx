import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../src/components/Dashboard';
import { vi } from 'vitest';
import { useNavigate } from 'react-router-dom';


const baseURI = import.meta.env.VITE_API_BASE_URL;

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock fetch responses
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url === baseURI + 'api/dashboard') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('Welcome to the Dashboard')
        });
      } else if (url === baseURI + 'api/dashboard/stats') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ client_count: 10 })
        });
      } else {
        return Promise.reject('Unknown URL');
      }
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('should render dashboard component with initial message', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for the dashboard message to appear
    const message = await waitFor(() => screen.getByText('Welcome to the Dashboard'));
    expect(message).toBeInTheDocument();
  });

  test('should fetch and display statistics on button click', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const statsButton = screen.getByText('Statistiques');
    fireEvent.click(statsButton);

    const stats = await waitFor(() => screen.getByText(/client_count/i));
    expect(stats).toBeInTheDocument();
    expect(stats).toHaveTextContent('10');
  });
  test('should show error if stats fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url === baseURI + 'api/dashboard') {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('Welcome to the Dashboard')
        });
      } else if (url === baseURI + 'api/dashboard/stats') {
        return Promise.resolve({ ok: false });
      }
    }));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const statsButton = screen.getByText('Statistiques');
    fireEvent.click(statsButton);

    await waitFor(() => expect(screen.queryByText(/client_count/i)).not.toBeInTheDocument());
  });
});
