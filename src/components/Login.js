import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });

            const { token, user } = response.data;
            if (!token || !user) {
                setError('Invalid login response from server.');
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userId', user.id);

            const role = user.role?.toLowerCase();

            switch (role) {
                case 'admin':
                    navigate('/admin-dashboard');
                    break;
                case 'non-admin':
                case 'nonadmin':
                    navigate('/non-admin-dashboard');
                    break;
                case 'user':
                default:
                    navigate('/member-dashboard');
            }
        } catch (err) {
            console.error("Login error:", err);
            const message = err.response?.data?.message || 'Login failed.';
            setError(message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <label className="block mb-2 font-semibold">Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />

                <label className="block mb-2 font-semibold">Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                    required
                />

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Login
                </button>

                <p className="mt-4 text-center">
                    Don't have an account?{' '}
                    <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => navigate('/register')}>
                        Register here
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;
