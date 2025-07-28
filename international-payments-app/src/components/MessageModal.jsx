// src/components/MessageModal.jsx
import React from 'react';

/**
 * Reusable modal component for displaying messages (success or error).
 * @param {object} props
 * @param {string} props.message - The message to display.
 * @param {string} props.type - 'success' or 'error'.
 * @param {function} props.onClose - Function to call when the modal is closed.
 */
const MessageModal = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
  const borderColor = type === 'success' ? 'border-green-500' : 'border-red-500';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg max-w-sm w-full`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className={`font-bold text-lg ${textColor}`}>
            {type === 'success' ? 'Success!' : 'Error!'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Close message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-700">{message}</p>
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className={`bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-300`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
