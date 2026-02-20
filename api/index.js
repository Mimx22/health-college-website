const express = require('express');
const app = express();
let logs = [];

function tryRequire(path, name) {
    try {
        require(path);
        logs.push(name + ': OK');
    } catch (e) {
        logs.push(name + ': ERROR - ' + e.message);
    }
}

tryRequire('../models/Student', 'ModelStudent');
tryRequire('../models/Staff', 'ModelStaff');
tryRequire('../models/Course', 'ModelCourse');
tryRequire('../models/Result', 'ModelResult');

tryRequire('../utils/sendEmail', 'UtilSendEmail');

tryRequire('../routes/authRoutes', 'RouteAuth');
tryRequire('../routes/studentRoutes', 'RouteStudent');
tryRequire('../routes/staffRoutes', 'RouteStaff');
tryRequire('../routes/adminRoutes', 'RouteAdmin');

app.get('/api/health', (req, res) => {
    res.json({ status: 'diagnostic', logs });
});

module.exports = app;
