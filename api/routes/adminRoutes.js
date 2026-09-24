const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { 
    loginAdmin, 
    getApplications, 
    updateApplicationStatus, 
    downloadDocument, 
    getContactMessages, 
    setStudentPassword,
    uploadImage
} = require('../controllers/adminController');
const {
    getAllNewsAdmin,
    getNewsByIdAdmin,
    createNewsAdmin,
    updateNewsAdmin,
    deleteNewsAdmin
} = require('../controllers/newsController');
const {
    getAllEventsAdmin,
    getEventByIdAdmin,
    createEventAdmin,
    updateEventAdmin,
    deleteEventAdmin
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

// Rate limit: Max 10 login attempts per 15 minutes per IP
router.post('/login', rateLimiter(10), loginAdmin);

// Admin Admissions Management
router.get('/applications', protect, authorizeRoles('admin'), getApplications);
router.put('/applications/:id/status', protect, authorizeRoles('admin'), updateApplicationStatus);
router.post('/applications/:id/password', protect, authorizeRoles('admin'), setStudentPassword);
router.get('/applications/:id/documents/:docIndex', protect, authorizeRoles('admin'), downloadDocument);
router.get('/messages', protect, authorizeRoles('admin'), getContactMessages);

// Admin Image Upload
router.post('/upload-image', protect, authorizeRoles('admin'), upload.single('image'), uploadImage);

// Admin News CMS Endpoints
router.get('/news', protect, authorizeRoles('admin'), getAllNewsAdmin);
router.post('/news', protect, authorizeRoles('admin'), createNewsAdmin);
router.get('/news/:id', protect, authorizeRoles('admin'), getNewsByIdAdmin);
router.put('/news/:id', protect, authorizeRoles('admin'), updateNewsAdmin);
router.delete('/news/:id', protect, authorizeRoles('admin'), deleteNewsAdmin);

// Admin Events CMS Endpoints
router.get('/events', protect, authorizeRoles('admin'), getAllEventsAdmin);
router.post('/events', protect, authorizeRoles('admin'), createEventAdmin);
router.get('/events/:id', protect, authorizeRoles('admin'), getEventByIdAdmin);
router.put('/events/:id', protect, authorizeRoles('admin'), updateEventAdmin);
router.delete('/events/:id', protect, authorizeRoles('admin'), deleteEventAdmin);

module.exports = router;
