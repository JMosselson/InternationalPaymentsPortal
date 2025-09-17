// server.js - Node.js Backend API for International Payments App with MongoDB

// --- Module Imports ---
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose'); // MongoDB ODM (Object Data Modeling) library
const bcrypt = require('bcryptjs'); // For password hashing
const cors = require('cors'); // For Cross-Origin Resource Sharing
const https = require('https'); // For HTTPS server
const fs = require('fs'); // Node.js File System module (for reading SSL certs)
const jwt = require('jsonwebtoken'); // For JSON Web Tokens (authentication)
const helmet = require('helmet'); // For setting security-related HTTP headers
const rateLimit = require('express-rate-limit'); // For rate limiting to prevent brute force/DoS

// --- Express App Initialization ---
const app = express();
const PORT = process.env.PORT || 5000; // Backend will run on port 5000

// --- Middleware ---
app.use(helmet()); // Set security-related HTTP headers (e.g., XSS Protection, CSP)
app.use(cors()); // Enable CORS for all origins (for development).
                 // In production, configure specific origins for better security.
app.use(express.json()); // Enable parsing of JSON request bodies

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/InternationalPaymentsDB';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB database.'))
    .catch(err => {
        console.error('MongoDB connection failed:', err);
        process.exit(1); // Exit the process if database connection fails at startup
    });

// --- JWT Secret ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
    process.exit(1);
}

// --- Mongoose Schemas and Models ---

// User Schema (for both customers and employees)
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, unique: true, sparse: true }, // unique but allows null for employees
    accountNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['customer', 'employee'] }, // 'customer' or 'employee'
    createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    provider: { type: String, required: true }, // e.g., 'SWIFT'
    payeeAccount: { type: String, required: true },
    swiftCode: { type: String, required: true },
    status: { type: String, required: true, enum: ['Pending', 'Verified', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    processedByEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// --- Utility Functions (Server-side validation) ---
const isValidFullName = (name) => /^[a-zA-Z\s'-]{2,}$/.test(name);
const isValidIdNumber = (idNumber) => /^\d{13}$/.test(idNumber); // Basic check
const isValidAccountNumber = (accountNumber) => /^\d{7,12}$/.test(accountNumber);
const isValidPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/.test(password);
const isValidAmount = (amount) => /^\d+(\.\d{1,2})?$/.test(amount) && parseFloat(amount) > 0;
const isValidSwiftCode = (swiftCode) => /^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(swiftCode);

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user; // Attach user payload from token to request
        next(); // Proceed to the next middleware/route handler
    });
};

// --- SSL Certificate Configuration ---
// Make sure 'key.pem' and 'cert.pem' are in the same directory as server.js
let privateKey, certificate, credentials;
try {
    privateKey = fs.readFileSync('key.pem', 'utf8');
    certificate = fs.readFileSync('cert.pem', 'utf8');
    credentials = { key: privateKey, cert: certificate };
} catch (err) {
    console.error('SSL Certificate Error: Could not read key.pem or cert.pem. Ensure they are in the same directory as server.js and generated correctly.');
    console.error('Error details:', err.message);
    // In a production environment, you might want to exit the process here
    // process.exit(1);
}

// --- Rate Limiting Configuration ---
// Apply to specific routes to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 5 requests per 15 minutes per IP
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Max 3 registration attempts per hour per IP
    message: 'Too many registration attempts from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

// --- API Routes ---
// 1. User Registration (Customer)
// Apply registerLimiter to this route
app.post('/api/register', registerLimiter, async (req, res) => {
    const { fullName, idNumber, accountNumber, password } = req.body;

    // Server-side input validation
    if (!isValidFullName(fullName) || !isValidIdNumber(idNumber) || !isValidAccountNumber(accountNumber) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Invalid input data. Please check all fields.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password

        const newUser = new User({
            fullName,
            idNumber,
            accountNumber,
            username: accountNumber, // Using accountNumber as username for customers
            passwordHash: hashedPassword,
            role: 'customer'
        });

        await newUser.save(); // Save new user to MongoDB

        res.status(201).json({ message: 'Registration successful!' });
    } catch (err) {
        console.error('Error during registration:', err);
        if (err.code === 11000) { // MongoDB duplicate key error code
            res.status(409).json({ message: 'Account number, ID number, or Username already exists.' });
        } else {
            res.status(500).json({ message: 'Server error during registration.' });
        }
    }
});

// 2. User Login (Customer & Employee)
// Apply loginLimiter to this route
app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, accountNumber, password } = req.body;

    // Server-side input validation
    if (!username || !isValidAccountNumber(accountNumber) || !password) {
        return res.status(400).json({ message: 'Username, account number, and password are required.' });
    }

    try {
        // Find user by username AND account number
        const user = await User.findOne({ username, accountNumber });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare provided password with hashed password from database
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({ message: 'Login successful!', token: token, role: user.role });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// 3. Make International Payment (Customer Portal)
app.post('/api/payments', authenticateToken, async (req, res) => {
    // Ensure only customers can make payments
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Access denied. Only customers can make payments.' });
    }

    const { amount, currency, provider, payeeAccount, swiftCode } = req.body;
    const customerId = req.user.userId; // Get customer ID from authenticated token

    // Server-side input validation
    if (!isValidAmount(amount) || !currency || !provider || !isValidAccountNumber(payeeAccount) || !isValidSwiftCode(swiftCode)) {
        return res.status(400).json({ message: 'Invalid payment data. Please check all fields.' });
    }

    try {
        const newTransaction = new Transaction({
            customerId: customerId,
            amount: parseFloat(amount), // Ensure amount is a number for API
            currency,
            provider,
            payeeAccount,
            swiftCode,
            status: 'Pending' // Initial status
        });

        await newTransaction.save(); // Save new transaction to MongoDB

        res.status(201).json({ message: 'Payment submitted successfully for processing!' });
    } catch (err) {
        console.error('Error submitting payment:', err);
        res.status(500).json({ message: 'Server error during payment submission.' });
    }
});

// 4. Fetch Transactions (Employee Portal)
app.get('/api/transactions', authenticateToken, async (req, res) => {
    // Ensure only employees can view transactions
    if (req.user.role !== 'employee') {
        return res.status(403).json({ message: 'Access denied. Only employees can view transactions.' });
    }

    try {
        // Populate customer details from the User collection
        const transactions = await Transaction.find()
            .populate('customerId', 'fullName') // Only fetch fullName from the User model
            .sort({ createdAt: -1 }); // Sort by creation date, newest first

        // Map to a cleaner format for the frontend
        const formattedTransactions = transactions.map(t => ({
            id: t._id, // MongoDB uses _id
            customerName: t.customerId ? t.customerId.fullName : 'N/A', // Handle case where customer might be missing
            amount: t.amount.toFixed(2), // Format amount to 2 decimal places
            currency: t.currency,
            provider: t.provider,
            payeeAccount: t.payeeAccount,
            swiftCode: t.swiftCode,
            status: t.status,
            createdAt: t.createdAt
        }));

        res.status(200).json({ transactions: formattedTransactions });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ message: 'Server error fetching transactions.' });
    }
});

// 5. Update Transaction Status (Employee Portal - Verify)
app.put('/api/transactions/:id/status', authenticateToken, async (req, res) => {
    // Ensure only employees can update transaction status
    if (req.user.role !== 'employee') {
        return res.status(403).json({ message: 'Access denied. Only employees can update transaction status.' });
    }

    const transactionId = req.params.id;
    const { status } = req.body; // Expected status: 'Verified' or 'Completed'
    const employeeId = req.user.userId; // Get employee ID from authenticated token

    if (!['Verified', 'Completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { status: status, processedByEmployeeId: employeeId },
            { new: true } // Return the updated document
        );

        if (updatedTransaction) {
            res.status(200).json({ message: `Transaction ${transactionId} status updated to ${status}.` });
        } else {
            res.status(404).json({ message: 'Transaction not found or no changes made.' });
        }
    } catch (err) {
        console.error('Error updating transaction status:', err);
        res.status(500).json({ message: 'Server error updating transaction status.' });
    }
});

// 6. Submit to SWIFT (Employee Portal)
app.post('/api/swift-submit', authenticateToken, async (req, res) => {
    // Ensure only employees can submit to SWIFT
    if (req.user.role !== 'employee') {
        return res.status(403).json({ message: 'Access denied. Only employees can submit to SWIFT.' });
    }

    const { transactionIds } = req.body; // Array of transaction IDs
    const employeeId = req.user.userId;

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({ message: 'No transactions selected for SWIFT submission.' });
    }

    try {
        // Find transactions and check if they are 'Verified'
        const transactionsToUpdate = await Transaction.find({
            _id: { $in: transactionIds },
            status: 'Verified'
        });

        if (transactionsToUpdate.length !== transactionIds.length) {
            const unverifiedCount = transactionIds.length - transactionsToUpdate.length;
            return res.status(400).json({
                message: `${unverifiedCount} selected transaction(s) are not yet verified and cannot be submitted to SWIFT.`,
                unverified: transactionIds.filter(id => !transactionsToUpdate.some(t => t._id.toString() === id))
            });
        }

        // Update status of selected transactions to 'Completed'
        const updateResult = await Transaction.updateMany(
            { _id: { $in: transactionIds } },
            { status: 'Completed', processedByEmployeeId: employeeId }
        );

        res.status(200).json({ message: `Successfully submitted ${updateResult.modifiedCount} transactions to SWIFT.` });

    } catch (err) {
        console.error('Error submitting to SWIFT:', err);
        res.status(500).json({ message: 'Server error during SWIFT submission.' });
    }
});

// --- Start the Server ---
// Only start the HTTPS server if certificates are successfully loaded
if (credentials) {
    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(PORT, () => {
        console.log(`Backend server running over HTTPS on port ${PORT}`);
        console.log(`Access it at https://localhost:${PORT}`);
    });
} else {
    // Fallback to HTTP if SSL certificates are not found/configured
    // In a production environment, you would likely want to prevent startup without SSL
    app.listen(PORT, () => {
        console.warn(`WARNING: Backend server running over HTTP on port ${PORT} due to missing SSL certificates.`);
        console.warn(`Access it at http://localhost:${PORT}`);
    });
}

// --- Graceful Shutdown ---
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    try {
        await mongoose.connection.close(); // Await the close operation
        console.log('MongoDB connection closed cleanly.');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
    } finally {
        process.exit(0); // Ensure process exits
    }
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    try {
        await mongoose.connection.close(); // Await the close operation
        console.log('MongoDB connection closed cleanly.');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
    } finally {
        process.exit(0); // Ensure process exits
    }
});

// --- Self-Signed Certificate Generation (Development Only) ---
// Uncomment the following lines to generate self-signed certificates for development
// Make sure to run this in the project directory where server.js is located
/*
const { exec } = require('child_process');
exec('openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes', (err, stdout, stderr) => {
    if (err) {
        console.error('Error generating self-signed certificate:', err);
        return;
    }
    console.log('Self-signed certificate generated successfully.');
});
*/

