// src/components/CustomerRegisterPage.jsx
import React, { useState } from 'react';
import { registerUser } from '../utils/api';
import { isValidFullName, isValidIdNumber, isValidAccountNumber, isValidPassword, doPasswordsMatch } from '../utils/validation';
import MessageModal from './MessageModal';

const CustomerRegisterPage = ({ setCurrentPage }) => {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // Client-side validation
    if (!fullName || !idNumber || !accountNumber || !password || !confirmPassword) {
      setMessage('All fields are required.');
      setMessageType('error');
      return;
    }
    if (!isValidFullName(fullName)) {
      setMessage('Full name is invalid. Use letters, spaces, hyphens, and apostrophes only.');
      setMessageType('error');
      return;
    }
    if (!isValidIdNumber(idNumber)) {
      setMessage('ID number must be 13 digits.');
      setMessageType('error');
      return;
    }
    if (!isValidAccountNumber(accountNumber)) {
      setMessage('Account number must be 7-12 digits.');
      setMessageType('error');
      return;
    }
    if (!isValidPassword(password)) {
      setMessage('Password must be at least 8 characters, with uppercase, lowercase, number, and special character.');
      setMessageType('error');
      return;
    }
    if (!doPasswordsMatch(password, confirmPassword)) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const result = await registerUser({ fullName, idNumber, accountNumber, password });
    setLoading(false);

    if (result.success) {
      setMessage(result.message + ' You can now log in.');
      setMessageType('success');
      // Redirect to login page after successful registration
      setTimeout(() => {
        setCurrentPage('customerLogin');
      }, 2000);
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
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Customer Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="idNumber" className="block text-gray-700 text-sm font-bold mb-2">
              ID Number (13 digits)
            </label>
            <input
              type="text"
              id="idNumber"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              maxLength="13"
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-gray-700 text-sm font-bold mb-2">
              Account Number (7-12 digits, also used as Username)
            </label>
            <input
              type="text"
              id="accountNumber"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              minLength="7"
              maxLength="12"
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
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => setCurrentPage('customerLogin')}
            className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none"
          >
            Login here
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

export default CustomerRegisterPage;
