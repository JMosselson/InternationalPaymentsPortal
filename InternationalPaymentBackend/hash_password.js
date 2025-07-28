const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password:', hashedPassword);
}

// Replace 'Test@1234' with the actual password you want for the employee
hashPassword('Test@1234');
