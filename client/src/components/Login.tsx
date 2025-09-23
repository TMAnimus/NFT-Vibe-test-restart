import React, { useState } from 'react';
import { loginPlayer } from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setToken(null);

        try {
            const jwtToken = await loginPlayer(username, pin);
            setToken(jwtToken);
            localStorage.setItem('jwt_token', jwtToken);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px', borderRadius: '5px' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {token && <p style={{ color: 'green' }}>Login successful!</p>}
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="username">Username:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="pin">4-Digit PIN:</label>
                    <input
                        id="pin"
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        style={{ marginLeft: '10px' }}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
