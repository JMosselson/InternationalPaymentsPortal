// scripts/create-employee.js - Create a new employee account
require('dotenv').config({ path: '../InternationalPaymentBackend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, unique: true, sparse: true },
    accountNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['customer', 'employee'] },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createEmployee() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/InternationalPaymentsDB';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n👨‍💼 Create New Employee Account');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const fullName = await question('Full Name: ');
        const username = await question('Username: ');
        const accountNumber = await question('Account Number (7-12 digits): ');
        const password = await question('Password (min 8 chars, uppercase, lowercase, number, special): ');

        // Validate inputs
        if (!fullName || !username || !accountNumber || !password) {
            throw new Error('All fields are required');
        }

        if (!/^\d{7,12}$/.test(accountNumber)) {
            throw new Error('Account number must be 7-12 digits');
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/.test(password)) {
            throw new Error('Password does not meet security requirements');
        }

        // Check if username or account number already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { accountNumber }]
        });

        if (existingUser) {
            throw new Error('Username or account number already exists');
        }

        // Hash password and create employee
        const passwordHash = await bcrypt.hash(password, 10);
        
        const newEmployee = new User({
            fullName,
            username,
            accountNumber,
            passwordHash,
            role: 'employee'
        });

        await newEmployee.save();

        console.log('\n✅ Employee account created successfully!');
        console.log(`Full Name: ${fullName}`);
        console.log(`Username: ${username}`);
        console.log(`Account Number: ${accountNumber}`);
        console.log(`Role: Employee`);

    } catch (error) {
        console.error('\n❌ Failed to create employee:', error.message);
    } finally {
        await mongoose.disconnect();
        rl.close();
    }
}

createEmployee();