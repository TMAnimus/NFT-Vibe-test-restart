import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../components/Register';
import * as api from '../services/api';

jest.mock('../services/api');

describe('Register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the registration form', () => {
    render(<Register />);
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/4-digit pin/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('calls registerPlayer with entered values on submit', async () => {
    (api.registerPlayer as jest.Mock).mockResolvedValue({ message: 'User created' });
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/4-digit pin/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() =>
      expect(api.registerPlayer).toHaveBeenCalledWith('alice', '1234')
    );
  });

  it('shows success message after successful registration', async () => {
    (api.registerPlayer as jest.Mock).mockResolvedValue({ message: 'Registration successful!' });
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/4-digit pin/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() =>
      expect(screen.getByText('Registration successful!')).toBeInTheDocument()
    );
  });

  it('shows error message when registration fails', async () => {
    (api.registerPlayer as jest.Mock).mockRejectedValue(new Error('Username already exists.'));
    render(<Register />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/4-digit pin/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() =>
      expect(screen.getByText('Username already exists.')).toBeInTheDocument()
    );
  });
});
