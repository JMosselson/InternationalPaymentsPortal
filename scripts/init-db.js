// Database initialization script for International Payments Portal
// This script creates default users and sample data

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/InternationalPaymentsDB';

// User Schema (matching server.js)
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, unique: true, sparse: true },
    accountNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['customer', 'employee'] },
    createdAt: { type: Date, default: Date.now }
});

// Transaction Schema (matching server.js)
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
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully!');

        // Check if data already exists
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log('📊 Database already has users. Skipping initialization.');
            await mongoose.disconnect();
            return;
        }

        console.log('🚀 Initializing database with default data...');

        // Create Employee Accounts
        const employees = [
            {
                fullName: 'System Administrator',
                accountNumber: '1234567890',
                username: 'admin',
                password: 'Admin@123',
                role: 'employee'
            },
            {
                fullName: 'Payment Processor',
                accountNumber: '1234567891',
                username: 'processor1',
                password: 'Process@123',
                role: 'employee'
            },
            {
                fullName: 'Payment Verifier',
                accountNumber: '1234567892',
                username: 'verifier1',
                password: 'Verify@123',
                role: 'employee'
            }
        ];

        console.log('👥 Creating employee accounts...');
        for (const emp of employees) {
            const hashedPassword = await bcrypt.hash(emp.password, 10);
            const employee = new User({
                fullName: emp.fullName,
                accountNumber: emp.accountNumber,
                username: emp.username,
                passwordHash: hashedPassword,
                role: emp.role
            });
            await employee.save();
            console.log(`   ✅ Created employee: ${emp.username}`);
        }

        // Create Sample Customer Accounts
        const customers = [
            {
                fullName: 'John Smith',
                idNumber: '9001010001087',
                accountNumber: '2000000001',
                username: 'johnsmith',
                password: 'Customer@123',
                role: 'customer'
            },
            {
                fullName: 'Mary Johnson',
                idNumber: '8506120002088',
                accountNumber: '2000000002',
                username: 'maryjohnson',
                password: 'Customer@456',
                role: 'customer'
            },
            {
                fullName: 'David Wilson',
                idNumber: '7712250003089',
                accountNumber: '2000000003',
                username: 'davidwilson',
                password: 'Customer@789',
                role: 'customer'
            }
        ];

        console.log('🏦 Creating customer accounts...');
        const createdCustomers = [];
        for (const cust of customers) {
            const hashedPassword = await bcrypt.hash(cust.password, 10);
            const customer = new User({
                fullName: cust.fullName,
                idNumber: cust.idNumber,
                accountNumber: cust.accountNumber,
                username: cust.username,
                passwordHash: hashedPassword,
                role: cust.role
            });
            const savedCustomer = await customer.save();
            createdCustomers.push(savedCustomer);
            console.log(`   ✅ Created customer: ${cust.username}`);
        }

        // Create Sample Transactions
        const sampleTransactions = [
            {
                customerId: createdCustomers[0]._id,
                amount: 1500.00,
                currency: 'USD',
                provider: 'Standard Bank',
                payeeAccount: 'US12345678901234567890',
                swiftCode: 'SBZAZAJJ',
                status: 'Pending'
            },
            {
                customerId: createdCustomers[1]._id,
                amount: 750.50,
                currency: 'EUR',
                provider: 'FNB',
                payeeAccount: 'DE12345678901234567890',
                swiftCode: 'FIRNZAJJ',
                status: 'Verified'
            },
            {
                customerId: createdCustomers[2]._id,
                amount: 2200.00,
                currency: 'GBP',
                provider: 'ABSA',
                payeeAccount: 'GB12345678901234567890',
                swiftCode: 'ABSA ZAJJ',
                status: 'Completed'
            }
        ];

        console.log('💸 Creating sample transactions...');
        for (const txn of sampleTransactions) {
            const transaction = new Transaction(txn);
            await transaction.save();
            console.log(`   ✅ Created transaction: ${txn.amount} ${txn.currency} (${txn.status})`);
        }

        console.log('\n🎉 Database initialization completed successfully!');
        console.log('\n📋 Default Login Credentials:');
        console.log('='.repeat(50));
        console.log('EMPLOYEES:');
        employees.forEach(emp => {
            console.log(`   ${emp.username} / ${emp.accountNumber} / ${emp.password}`);
        });
        console.log('\nCUSTOMERS:');
        customers.forEach(cust => {
            console.log(`   ${cust.username} / ${cust.accountNumber} / ${cust.password}`);
        });
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run initialization
initializeDatabase();