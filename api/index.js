const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        engine: 'Express on Vercel',
        time: new Date().toISOString()
    });
});

// For testing if sub-routes work without vercel.json
app.get('/api/test', (req, res) => {
    res.json({ msg: 'Sub-route works' });
});

module.exports = app;
