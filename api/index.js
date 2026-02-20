const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Mock MongoDB state
const mongoose = {
    connection: { readyState: 1 } // Pretend we are connected
};

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: 'MOCKED',
        time: new Date().toISOString()
    });
});

// Minimal Routes (Mocked or simple)
app.use('/api/auth', (req, res) => res.json({ msg: 'Auth Mock' }));
app.use('/api/students', (req, res) => res.json({ msg: 'Students Mock' }));

module.exports = app;
