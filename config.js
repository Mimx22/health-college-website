/*  ── API Configuration ──────────────────────────────────────────────────
 *  This single file controls where ALL fetch() calls in the frontend
 *  point to.  Change the URL here and every page picks it up automatically.
 *
 *  LOCAL  →  'http://localhost:5000/api'
 *  LIVE   →  'https://YOUR-BACKEND.onrender.com/api'
 */
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Check if we're running locally (localhost, 127.0.0.1, or file://)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || protocol === 'file:') {
        return 'http://localhost:5000/api';
    }

    // Default to the production URL for everything else
    return 'https://jos-medical-college-api.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log the endpoint for debugging purposes (Production-ready audit)
console.log(`[API Config] Active Endpoint: ${API_BASE_URL}`);
console.log(`[API Config] Mode: ${window.location.hostname === 'localhost' ? 'Development' : 'Production'}`);

// --- Self-Healing Wake-up ---
// Hit the backend immediately on page load to "wake it up" from Render's sleep mode.
// This ensures the server is warm by the time the user clicks "Login".
if (API_BASE_URL.includes('onrender.com')) {
    console.log('[API Config] Waking up live server...');
    fetch(API_BASE_URL.replace('/api', '/')).catch(() => { }); // Hit root health check
}
