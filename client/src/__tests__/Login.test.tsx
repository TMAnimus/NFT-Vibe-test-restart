import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Login';
import * as api from '../services/api';

jest.mock('../services/api');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () =>
    render(<MemoryRouter><Login /></MemoryRouter>);

  it('renders the login form', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/4-digit pin/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('stores token and navigates to / on successful login', async () => {
    (api.loginPlayer as jest.Mock).mockResolvedValue('mock.jwt.token');
    renderLogin();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/4-digit pin/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('jwt_token')).toBe('mock.jwt.token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error message on failed login', async () => {
    (api.loginPlayer as jest.Mock).mockRejectedValue(new Error('Invalid username or PIN.'));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/4-digit pin/i), { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(screen.getByText('Invalid username or PIN.')).toBeInTheDocument()
    );
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  it('calls loginPlayer with the entered credentials', async () => {
    (api.loginPlayer as jest.Mock).mockResolvedValue('token');
    renderLogin();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'bob' } });
    fireEvent.change(screen.getByLabelText(/4-digit pin/i), { target: { value: '5678' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(api.loginPlayer).toHaveBeenCalledWith('bob', '5678')
    );
  });
});
