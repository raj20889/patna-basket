// Keep-alive service to prevent Render cold starts
const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (before 15-min timeout)

function ping() {
  const url = new URL('/health', BACKEND_URL);
  
  https.get(url.toString(), (res) => {
    console.log(`Keep-alive ping: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Keep-alive ping failed:', err.message);
  });
}

// Only run keep-alive in production
if (process.env.NODE_ENV === 'production') {
  console.log('Keep-alive service started (14-minute interval)');
  setInterval(ping, PING_INTERVAL);
  // Initial ping after 5 seconds
  setTimeout(ping, 5000);
}

module.exports = { ping };
