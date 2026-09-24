const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const { getPublishedNews, getNewsBySlug } = require('../controllers/newsController');

// Public News Endpoints
router.get('/', rateLimiter(60), getPublishedNews);
router.get('/:slug', rateLimiter(60), getNewsBySlug);

module.exports = router;
