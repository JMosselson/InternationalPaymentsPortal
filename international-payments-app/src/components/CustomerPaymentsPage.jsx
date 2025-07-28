
// src/components/CustomerPaymentsPage.jsx
import React, { useState } from 'react';
import { makePayment } from '../utils/api';
import { isValidAmount, isValidCurrency, isValidAccountNumber, isValidSwiftCode } from '../utils/validation';
import MessageModal from './MessageModal';

const CustomerPaymentsPage = ({ token, setCurrentPage, handleLogout }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [provider, setProvider] = useState('');
  const [payeeAccount, setPayeeAccount] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    // Client-side validation
    if (!amount || !currency || !provider || !payeeAccount || !swiftCode) {
      setMessage('All fields are required.');
      setMessageType('error');
      return;
    }
    if (!isValidAmount(amount)) {
      setMessage('Amount must be a positive number with up to two decimal places.');
      setMessageType('error');
      return;
    }
    if (!isValidCurrency(currency.toUpperCase())) { // Convert to uppercase for validation
      setMessage('Currency must be a 3-letter uppercase code (e.g., USD, EUR).');
      setMessageType('error');
      return;
    }
    if (!isValidAccountNumber(payeeAccount)) {
      setMessage('Payee account number must be 7-12 digits.');
      setMessageType('error');
      return;
    }
    if (!isValidSwiftCode(swiftCode)) {
      setMessage('SWIFT Code must be 8 or 11 alphanumeric characters.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    const result = await makePayment({
      amount: parseFloat(amount), // Ensure amount is a number for API
      currency: currency.toUpperCase(), // Send uppercase currency code
      provider,
      payeeAccount,
      swiftCode
    }, token);
    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setMessageType('success');
      // Clear form after successful submission
      setAmount('');
      setCurrency('');
      setProvider('');
      setPayeeAccount('');
      setSwiftCode('');
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
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Make International Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-gray-700 text-sm font-bold mb-2">
              Currency (e.g., USD, EUR, ZAR)
            </label>
            <input
              type="text"
              id="currency"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
              maxLength="3"
              placeholder="e.g., USD"
            />
          </div>
          <div>
            <label htmlFor="provider" className="block text-gray-700 text-sm font-bold mb-2">
              Payment Provider
            </label>
            <select
              id="provider"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required
            >
              <option value="">Select Provider</option>
              <option value="SWIFT">SWIFT</option>
              {/* Add other providers if necessary */}
            </select>
          </div>
          <div>
            <label htmlFor="payeeAccount" className="block text-gray-700 text-sm font-bold mb-2">
              Payee Account Number
            </label>
            <input
              type="text"
              id="payeeAccount"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={payeeAccount}
              onChange={(e) => setPayeeAccount(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="swiftCode" className="block text-gray-700 text-sm font-bold mb-2">
              SWIFT/BIC Code
            </label>
            <input
              type="text"
              id="swiftCode"
              className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value)}
              required
              maxLength="11"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-300"
        >
          Logout
        </button>
      </div>
      <MessageModal message={message} type={messageType} onClose={closeModal} />
    </div>
  );
};

export default CustomerPaymentsPage;
