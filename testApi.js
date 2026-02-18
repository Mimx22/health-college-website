const axios = require('axios');

const baseURL = 'http://localhost:5000/api/students';

// Test Registration
async function testRegister() {
    try {
        const res = await axios.post(`${baseURL}/register`, {
            fullName: "Miracle Asala",
            email: "miracle@example.com",
            phone: "08012345678",
            password: "miracle123"
        });
        console.log('Register Response:', res.data);
    } catch (err) {
        console.log('Register Error:', err.response ? err.response.data : err.message);
    }
}

// Test Login
async function testLogin() {
    try {
        const res = await axios.post(`${baseURL}/login`, {
            email: "miracle@example.com",
            password: "miracle123"
        });
        console.log('Login Response:', res.data);
    } catch (err) {
        console.log('Login Error:', err.response ? err.response.data : err.message);
    }
}

async function runTests() {
    await testRegister();
    await testLogin();
}

runTests();
