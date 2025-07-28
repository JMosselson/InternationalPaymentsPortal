// src/App.jsx
import React, { useState, useEffect } from 'react';
import CustomerLoginPage from './components/CustomerLoginPage';
import CustomerRegisterPage from './components/CustomerRegisterPage';
import CustomerPaymentsPage from './components/CustomerPaymentsPage';
import EmployeeLoginPage from './components/EmployeeLoginPage';
import EmployeeDashboardPage from './components/EmployeeDashboardPage';

function App() {
  // State to manage current page, authentication status, user role, and JWT token
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'customer' or 'employee'
  const [token, setToken] = useState(null); // JWT token

  // Effect to check for stored token and role on app load (e.g., from localStorage)
  // For this assignment, we'll keep it simple and not persist login across sessions
  // but in a real app, you'd load token from localStorage here.
  useEffect(() => {
    // Example: Check localStorage for token and role if you want persistent login
    // const storedToken = localStorage.getItem('token');
    // const storedRole = localStorage.getItem('userRole');
    // if (storedToken && storedRole) {
    //   setToken(storedToken);
    //   setUserRole(storedRole);
    //   setIsLoggedIn(true);
    //   // Redirect to appropriate dashboard
    //   if (storedRole === 'customer') {
    //     setCurrentPage('customerPayments');
    //   } else if (storedRole === 'employee') {
    //     setCurrentPage('employeeDashboard');
    //   }
    // }
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    setIsLoggedIn(false);
    // localStorage.removeItem('token'); // Clear from storage if using persistent login
    // localStorage.removeItem('userRole');
    setCurrentPage('home'); // Go back to home page after logout
  };

  // Conditional rendering based on authentication state and user role
  const renderPage = () => {
    if (isLoggedIn) {
      if (userRole === 'customer') {
        return <CustomerPaymentsPage token={token} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
      } else if (userRole === 'employee') {
        return <EmployeeDashboardPage token={token} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />;
      }
    }

    // If not logged in, or role is not recognized
    switch (currentPage) {
      case 'customerLogin':
        return <CustomerLoginPage setToken={setToken} setUserRole={setUserRole} setIsLoggedIn={setIsLoggedIn} setCurrentPage={setCurrentPage} />;
      case 'customerRegister':
        return <CustomerRegisterPage setCurrentPage={setCurrentPage} />;
      case 'employeeLogin':
        return <EmployeeLoginPage setToken={setToken} setUserRole={setUserRole} setIsLoggedIn={setIsLoggedIn} setCurrentPage={setCurrentPage} />;
      default: // Home Page
        return (
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to International Payments</h1>
              <div className="space-y-4">
                <button
                  onClick={() => setCurrentPage('customerLogin')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
                >
                  Customer Login
                </button>
                <button
                  onClick={() => setCurrentPage('customerRegister')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300"
                >
                  Customer Register
                </button>
                <button
                  onClick={() => setCurrentPage('employeeLogin')}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                >
                  Employee Login
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
