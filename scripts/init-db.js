// scripts/init-db.js - Database Initialization Script
// This script sets up the MongoDB database with initial data for the International Payments Portal

require('dotenv').config({ path: '../InternationalPaymentBackend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/InternationalPaymentsDB';

console.log('🔄 Initializing International Payments Database...');

// User Schema (matches the one in server.js)
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, unique: true, sparse: true },
    accountNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['customer', 'employee'] },
    createdAt: { type: Date, default: Date.now }
});

// Transaction Schema (matches the one in server.js)
const transactionSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    provider: { type: String, required: true },
    payeeAccount: { type: String, required: true },
    swiftCode: { type: String, required: true },
    status: { type: String, required: true, enum: ['Pending', 'Verified', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    processedByEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

async function initializeDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if data already exists
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('📊 Database already contains data. Skipping initialization.');
            await mongoose.disconnect();
            return;
        }

        console.log('🆕 Database is empty. Initializing with default data...');

        // Create default employee accounts
        const employees = [
            {
                fullName: "System Administrator",
                idNumber: null, // Employee doesn't need ID number
                accountNumber: "1234567890",
                username: "admin",
                passwordHash: await bcrypt.hash("Admin@123", 10),
                role: "employee"
            },
            {
                fullName: "Payment Processor",
                idNumber: null,
                accountNumber: "1234567891",
                username: "processor1",
                passwordHash: await bcrypt.hash("Process@123", 10),
                role: "employee"
            },
            {
                fullName: "Senior Verifier",
                idNumber: null,
                accountNumber: "1234567892",
                username: "verifier1",
                passwordHash: await bcrypt.hash("Verify@123", 10),
                role: "employee"
            }
        ];

        console.log('👨‍💼 Creating employee accounts...');
        const createdEmployees = await User.insertMany(employees);
        console.log(`✅ Created ${createdEmployees.length} employee accounts`);

        // Create sample customer accounts for testing
        const customers = [
            {
                fullName: "John Smith",
                idNumber: "9001010001088",
                accountNumber: "2000000001",
                username: "johnsmith",
                passwordHash: await bcrypt.hash("Customer@123", 10),
                role: "customer"
            },
            {
                fullName: "Mary Johnson",
                idNumber: "8505150002066",
                accountNumber: "2000000002",
                username: "maryjohnson",
                passwordHash: await bcrypt.hash("Customer@456", 10),
                role: "customer"
            },
            {
                fullName: "David Wilson",
                idNumber: "7709120003044",
                accountNumber: "2000000003",
                username: "davidwilson",
                passwordHash: await bcrypt.hash("Customer@789", 10),
                role: "customer"
            }
        ];

        console.log('👥 Creating sample customer accounts...');
        const createdCustomers = await User.insertMany(customers);
        console.log(`✅ Created ${createdCustomers.length} customer accounts`);

        // Create sample transactions for testing
        const sampleTransactions = [
            {
                customerId: createdCustomers[0]._id,
                amount: 1500.00,
                currency: "USD",
                provider: "SWIFT",
                payeeAccount: "9876543210",
                swiftCode: "ABCDUS33",
                status: "Pending"
            },
            {
                customerId: createdCustomers[1]._id,
                amount: 750.50,
                currency: "EUR",
                provider: "SWIFT",
                payeeAccount: "5432167890",
                swiftCode: "DEFGDE33",
                status: "Verified",
                processedByEmployeeId: createdEmployees[0]._id
            },
            {
                customerId: createdCustomers[2]._id,
                amount: 2250.75,
                currency: "GBP",
                provider: "SWIFT",
                payeeAccount: "1357924680",
                swiftCode: "GHIJGB22",
                status: "Completed",
                processedByEmployeeId: createdEmployees[1]._id
            }
        ];

        console.log('💳 Creating sample transactions...');
        const createdTransactions = await Transaction.insertMany(sampleTransactions);
        console.log(`✅ Created ${createdTransactions.length} sample transactions`);

        console.log('\n🎉 Database initialization completed successfully!');
        console.log('\n📋 Default Accounts Created:');
        console.log('\n👨‍💼 EMPLOYEE ACCOUNTS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Username: admin       | Account: 1234567890 | Password: Admin@123');
        console.log('2. Username: processor1  | Account: 1234567891 | Password: Process@123');
        console.log('3. Username: verifier1   | Account: 1234567892 | Password: Verify@123');

        console.log('\n👥 CUSTOMER ACCOUNTS (for testing):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Username: johnsmith    | Account: 2000000001 | Password: Customer@123');
        console.log('2. Username: maryjohnson  | Account: 2000000002 | Password: Customer@456');
        console.log('3. Username: davidwilson  | Account: 2000000003 | Password: Customer@789');

        console.log('\n💡 Tips:');
        console.log('• Use employee accounts to access the admin dashboard');
        console.log('• Use customer accounts to test payment submissions');
        console.log('• Sample transactions are available for testing verification workflows');
        console.log('• All passwords follow strong security requirements');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        if (error.code === 11000) {
            console.log('💡 This might be a duplicate key error. The database may already be initialized.');
        }
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the initialization
initializeDatabase().catch(console.error);