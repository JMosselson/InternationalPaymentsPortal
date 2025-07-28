// src/components/EmployeeDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchTransactions, updateTransactionStatus, submitToSwift } from '../utils/api';
import MessageModal from './MessageModal';

const EmployeeDashboardPage = ({ token, handleLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState([]); // For SWIFT submission

  const getTransactions = useCallback(async () => {
    setLoading(true);
    const result = await fetchTransactions(token);
    if (result.success) {
      setTransactions(result.transactions);
    } else {
      setMessage(result.message);
      setMessageType('error');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const handleVerify = async (transactionId) => {
    setMessage('');
    const result = await updateTransactionStatus(transactionId, 'Verified', token);
    if (result.success) {
      setMessage(result.message);
      setMessageType('success');
      getTransactions(); // Refresh list
    } else {
      setMessage(result.message);
      setMessageType('error');
    }
  };

  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactions(prevSelected =>
      prevSelected.includes(transactionId)
        ? prevSelected.filter(id => id !== transactionId)
        : [...prevSelected, transactionId]
    );
  };

  const handleSubmitToSwift = async () => {
    if (selectedTransactions.length === 0) {
      setMessage('Please select transactions to submit to SWIFT.');
      setMessageType('error');
      return;
    }
    setMessage('');
    setLoading(true);
    const result = await submitToSwift(selectedTransactions, token);
    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setMessageType('success');
      setSelectedTransactions([]); // Clear selection
      getTransactions(); // Refresh list
    } else {
      setMessage(result.message);
      setMessageType('error');
    }
  };

  const closeModal = () => {
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Employee Dashboard</h2>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleSubmitToSwift}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 disabled:opacity-50"
            disabled={selectedTransactions.length === 0 || loading}
          >
            Submit Selected to SWIFT ({selectedTransactions.length})
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-300"
          >
            Logout
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-center text-gray-600">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payee Account
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SWIFT Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.status === 'Verified' && (
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => handleCheckboxChange(transaction.id)}
                          className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.payeeAccount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.swiftCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {transaction.status === 'Pending' && (
                        <button
                          onClick={() => handleVerify(transaction.id)}
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300"
                        >
                          Verify
                        </button>
                      )}
                      {/* Submit to SWIFT button is handled by the group action above */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <MessageModal message={message} type={messageType} onClose={closeModal} />
    </div>
  );
};

export default EmployeeDashboardPage;
