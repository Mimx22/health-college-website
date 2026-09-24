const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const { getPublishedEvents, getEventBySlug } = require('../controllers/eventController');

// Public Events Endpoints
router.get('/', rateLimiter(60), getPublishedEvents);
router.get('/:slug', rateLimiter(60), getEventBySlug);

module.exports = router;
