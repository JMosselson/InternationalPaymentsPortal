// src/utils/api.js

// --- IMPORTANT: Update this URL to your backend API server's address ---
// Ensure this matches the port your Node.js backend is running on (e.g., 5000)
// And use HTTPS if you've configured your backend for SSL.
const API_BASE_URL = 'https://localhost:5000/api'; // Changed to HTTPS

/**
 * Sends user registration data to the backend API.
 * @param {object} userData - { fullName, idNumber, accountNumber, password }
 * @returns {Promise<object>} - { success: boolean, message: string }
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData), // Send data to backend
    });

    const data = await response.json();
    if (!response.ok) {
      // If response status is not 2xx, throw an error
      throw new Error(data.message || 'Registration failed');
    }
    return { success: true, message: data.message || 'Registration successful!' };
  } catch (error) {
    console.error('Registration API error:', error);
    return { success: false, message: error.message || 'Registration failed due to an unexpected error.' };
  }
};

/**
 * Sends user login credentials to the backend API.
 * @param {object} credentials - { username, accountNumber, password }
 * @returns {Promise<object>} - { success: boolean, message: string, token?: string, role?: string }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    // Assuming backend sends a token and role on successful login
    return { success: true, message: data.message || 'Login successful!', token: data.token, role: data.role };
  } catch (error) {
    console.error('Login API error:', error);
    return { success: false, message: error.message || 'Login failed due to an unexpected error.' };
  }
};

/**
 * Sends payment data to the backend API.
 * Requires authentication token.
 * @param {object} paymentData - { amount, currency, provider, payeeAccount, swiftCode }
 * @param {string} token - Authentication token (e.g., JWT)
 * @returns {Promise<object>} - { success: boolean, message: string }
 */
export const makePayment = async (paymentData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Send token for authentication
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Payment failed');
    }
    return { success: true, message: data.message || 'Payment submitted successfully!' };
  } catch (error) {
    console.error('Payment API error:', error);
    return { success: false, message: error.message || 'Payment failed due to an unexpected error.' };
  }
};

/**
 * Fetches transactions for the employee dashboard from the backend API.
 * Requires authentication token.
 * @param {string} token - Authentication token
 * @returns {Promise<object>} - { success: boolean, message: string, transactions?: Array<object> }
 */
export const fetchTransactions = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch transactions');
    }
    return { success: true, transactions: data.transactions };
  } catch (error) {
    console.error('Fetch transactions API error:', error);
    return { success: false, message: error.message || 'Failed to fetch transactions.' };
  }
};

/**
 * Updates a transaction status (e.g., verifying) via the backend API.
 * @param {string} transactionId
 * @param {string} newStatus
 * @param {string} token
 * @returns {Promise<object>} - { success: boolean, message: string }
 */
export const updateTransactionStatus = async (transactionId, newStatus, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update transaction status');
    }
    return { success: true, message: data.message || 'Transaction status updated.' };
  } catch (error) {
    console.error('Update transaction status API error:', error);
    return { success: false, message: error.message || 'Failed to update transaction status.' };
  }
};

/**
 * Submits transactions to SWIFT via the backend API.
 * @param {Array<string>} transactionIds - Array of transaction IDs to submit
 * @param {string} token
 * @returns {Promise<object>} - { success: boolean, message: string }
 */
export const submitToSwift = async (transactionIds, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/swift-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transactionIds }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit to SWIFT');
    }
    return { success: true, message: data.message || 'Transactions submitted to SWIFT.' };
  } catch (error) {
    console.error('Submit to SWIFT API error:', error);
    return { success: false, message: error.message || 'Failed to submit to SWIFT.' };
  }
};
/**
 * Fetches the current user's profile data from the backend API.
 * Requires authentication token.
 * @param {string} token - Authentication token
 * @returns {Promise<object>} - { success: boolean, message: string, profile?: object }
 */