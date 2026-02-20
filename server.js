const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', msg: 'MINIMAL API IS LIVE' });
});

// Catch-all
app.get('*', (req, res) => {
    res.json({ status: 'ok', msg: 'GLOBAL CATCH ALL' });
});

module.exports = app;
