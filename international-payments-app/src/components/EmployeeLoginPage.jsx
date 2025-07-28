// src/components/EmployeeLoginPage.jsx
import React, { useState } from 'react';
import { loginUser } from '../utils/api';
import { isValidAccountNumber } from '../utils/validation';
import MessageModal from './MessageModal';

const EmployeeLoginPage = ({ setToken, setUserRole, setIsLoggedIn, setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // Client-side validation
    if (!username || !accountNumber || !password) {
      setMessage('All fields are required.');
      setMessageType('error');
      return;
    }
    if (!isValidAccountNumber(accountNumber)) {
      setMessage('Invalid account number format.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const result = await loginUser({ username, accountNumber, password });
    setLoading(false);

    if (result.success) {
      // Ensure it's an employee logging in here
      if (result.role === 'employee') {
        setMessage(result.message);
        setMessageType('success');
        setToken(result.token);
        setUserRole(result.role);
        setIsLoggedIn(true);
        setTimeout(() => {
          setCurrentPage('employeeDashboard');
        }, 1500);
      } else {
        // Logged in successfully but as a customer
        setMessage('Access Denied: This portal is for employees only.');
        setMessageType('error');
        // Clear token/role if accidentally set
        setToken(null);
        setUserRole(null);
        setIsLoggedIn(false);
      }
    } else {
      setMessage(result.message);
      setMessageType('error');
    }
  };

  const closeModal = () => {
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Employee Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-gray-700 text-sm font-bold mb-2">
              Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <button
          onClick={() => setCurrentPage('home')}
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-300"
        >
          Back to Home
        </button>
      </div>
      <MessageModal message={message} type={messageType} onClose={closeModal} />
    </div>
  );
};

export default EmployeeLoginPage;
