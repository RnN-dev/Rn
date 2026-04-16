/* ===================================================================
   RENAN.DEV — Express Backend Server
   Serves static files + API routes for contact & visitor tracking
   =================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the project root
app.use(express.static(path.join(__dirname)));

// --- Simple file-based data store ---
const DATA_DIR = path.join(__dirname, 'data');
const VISITORS_FILE = path.join(DATA_DIR, 'visitors.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(filePath, defaultValue) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
    }
    return defaultValue;
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- API: Visitor Counter ---
app.get('/api/visitors', (req, res) => {
    const data = readJSON(VISITORS_FILE, { count: 0 });
    data.count++;
    writeJSON(VISITORS_FILE, data);

    res.json({
        success: true,
        visitors: data.count,
    });
});

app.get('/api/visitors/count', (req, res) => {
    const data = readJSON(VISITORS_FILE, { count: 0 });
    res.json({
        success: true,
        visitors: data.count,
    });
});

// --- API: Contact Form ---
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'All fields are required: name, email, message',
        });
    }

    if (name.length > 100 || email.length > 100 || message.length > 2000) {
        return res.status(400).json({
            success: false,
            error: 'Field too long. Max: name(100), email(100), message(2000)',
        });
    }

    // Save the contact message
    const contacts = readJSON(CONTACTS_FILE, []);
    contacts.push({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
    });

    writeJSON(CONTACTS_FILE, contacts);

    console.log(`📩 New contact from: ${name} <${email}>`);

    res.json({
        success: true,
        message: 'Message received! Thank you.',
    });
});

// --- API: Health check ---
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

// --- Fallback: serve index.html ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════╗
  ║   🚀 Renan.dev Server Running       ║
  ║   http://localhost:${PORT}              ║
  ║   Press Ctrl+C to stop              ║
  ╚══════════════════════════════════════╝
    `);
});
