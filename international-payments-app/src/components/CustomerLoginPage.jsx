// src/components/CustomerLoginPage.jsx
import React, { useState } from 'react';
import { loginUser } from '../utils/api';
import { isValidAccountNumber } from '../utils/validation';
import MessageModal from './MessageModal';

const CustomerLoginPage = ({ setToken, setUserRole, setIsLoggedIn, setCurrentPage }) => {
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
      setMessage(result.message);
      setMessageType('success');
      setToken(result.token);
      setUserRole(result.role);
      setIsLoggedIn(true);
      // Redirect based on role after a short delay for message visibility
      setTimeout(() => {
        if (result.role === 'customer') {
          setCurrentPage('customerPayments');
        } else {
          // This page is for customer login, so if an employee logs in here,
          // it's an unexpected scenario, but we handle it by redirecting to employee dashboard.
          setCurrentPage('employeeDashboard');
        }
      }, 1500);
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
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Customer Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentPage('customerRegister')}
            className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none"
          >
            Register here
          </button>
        </p>
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

export default CustomerLoginPage;
