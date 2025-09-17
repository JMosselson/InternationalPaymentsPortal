# International Payments Portal - Setup Guide

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```cmd
# Navigate to project directory
cd "C:\Users\mosse\OneDrive\Documents\Visual Studio Web Applications\InternationalPaymentsPortal"

# Run the startup script
start.bat
```

### Option 2: Manual Setup

#### Prerequisites
1. **Node.js** (v16 or higher) - Download from https://nodejs.org/
2. **MongoDB** - Download from https://www.mongodb.com/try/download/community
3. **OpenSSL** (for SSL certificates) - Usually included with Git for Windows

#### Step-by-Step Setup

1. **Install Dependencies**
   ```cmd
   # Backend dependencies
   cd InternationalPaymentBackend
   npm install

   # Frontend dependencies
   cd ..\international-payments-app
   npm install
   ```

2. **Start MongoDB**
   ```cmd
   # If installed as service
   net start MongoDB

   # Or manual start
   mongod --dbpath C:\data\db
   ```

3. **Initialize Database**
   ```cmd
   cd scripts
   node init-db.js
   ```

4. **Start Servers**
   ```cmd
   # Terminal 1 - Backend
   cd InternationalPaymentBackend
   node server.js

   # Terminal 2 - Frontend
   cd international-payments-app
   npm start
   ```

## 🔐 Default Login Credentials

### Employee Accounts
| Username   | Account Number | Password     | Role              |
|-----------|---------------|--------------|-------------------|
| admin     | 1234567890    | Admin@123    | System Admin      |
| processor1| 1234567891    | Process@123  | Payment Processor |
| verifier1 | 1234567892    | Verify@123   | Senior Verifier   |

### Customer Accounts (Testing)
| Username    | Account Number | Password      | ID Number     |
|------------|---------------|---------------|---------------|
| johnsmith  | 2000000001    | Customer@123  | 9001010001088 |
| maryjohnson| 2000000002    | Customer@456  | 8505150002066 |
| davidwilson| 2000000003    | Customer@789  | 7709120003044 |

## 🛠️ Utility Scripts

### Database Management
- `reset-db.bat` - Reset and reinitialize database
- `scripts/init-db.js` - Initialize database with default data
- `scripts/create-employee.js` - Create new employee accounts

### Server Management
- `start.bat` - Start the entire application
- `stop.bat` - Stop all running servers

## 🌐 Application URLs

- **Frontend**: https://localhost:3000
- **Backend API**: https://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is installed and running
   - Check if port 27017 is available
   - Verify data directory exists: `C:\data\db`

2. **SSL Certificate Warnings**
   - Normal for development with self-signed certificates
   - Click "Advanced" → "Proceed to localhost" in browser

3. **Port Already in Use**
   - Run `stop.bat` to kill existing processes
   - Check `netstat -an | find ":3000"` for port usage

4. **Node Modules Missing**
   - Delete `node_modules` folder and run `npm install`

### Manual Database Reset
```cmd
# Connect to MongoDB
mongosh

# Switch to database
use InternationalPaymentsDB

# Drop database
db.dropDatabase()

# Exit and reinitialize
exit
node scripts/init-db.js
```

## 📝 Development Notes

- Frontend runs on HTTPS (port 3000) with self-signed certificates
- Backend API runs on HTTPS (port 5000) with SSL encryption
- JWT tokens expire after 1 hour
- Rate limiting enabled for security (5 login attempts per 15 minutes)
- Password requirements: 8+ chars, uppercase, lowercase, number, special character

## 🔒 Security Features

- SSL/TLS encryption for all communications
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for API endpoints
- Input validation (client and server-side)
- Security headers with Helmet
- CORS configuration

## 📊 Database Schema

### Users Collection
- `fullName`: User's full name
- `idNumber`: South African ID (customers only)
- `accountNumber`: Unique account identifier
- `username`: Login username
- `passwordHash`: Encrypted password
- `role`: 'customer' or 'employee'

### Transactions Collection
- `customerId`: Reference to customer
- `amount`: Payment amount
- `currency`: Currency code (USD, EUR, etc.)
- `provider`: Payment provider (SWIFT)
- `payeeAccount`: Recipient account
- `swiftCode`: SWIFT/BIC code
- `status`: Pending/Verified/Completed
- `processedByEmployeeId`: Employee who processed