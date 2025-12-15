import bcryptjs from 'bcryptjs';
import fs from 'fs';

const usersData = fs.readFileSync('./src/data/users.json', 'utf-8');
const users = JSON.parse(usersData);
const admin = users[0];

console.log('Testing authentication...');
console.log('Email:', admin.email);
console.log('Stored hash:', admin.password);

// Test with the password
const password = 'admin123';
bcryptjs.compare(password, admin.password, (err, result) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Password match:', result);
    }
});
