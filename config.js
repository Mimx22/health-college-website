/*  ── API Configuration ──────────────────────────────────────────────────
 *  This single file controls where ALL fetch() calls in the frontend
 *  point to.  Change the URL here and every page picks it up automatically.
 *
 *  LOCAL  →  'http://localhost:5000/api'
 *  LIVE   →  'https://YOUR-BACKEND.onrender.com/api'
 */
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;

    // Check if we're running locally (localhost or 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }

    // Default to the production URL for everything else
    return 'https://jos-medical-college-api.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();
