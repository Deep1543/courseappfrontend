import React from 'react';
import { useNavigate } from 'react-router-dom';
import onlineImage from '../images/sd.jpg';

const Home = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    // Update the logged-in state
    setIsLoggedIn(false);
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {username}!
              </h1>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
            
            <div className="mb-8">
              <img
                src={onlineImage}
                alt="Online Learning"
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4">Start Your Learning Journey</h2>
              <p className="text-gray-600">
                Explore our wide range of courses designed to help you achieve your goals.
                Whether you're interested in programming, design, or business, we have the
                perfect course for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;