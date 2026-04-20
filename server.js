
/* ================================================
   RENAN RODRIGUES — Express Server
   Secure, production-ready backend
   ================================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security Middleware ---
const securityHeaders = (req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; '));
    
    next();
};

// --- Rate Limiting (Simple In-Memory) ---
const rateLimitStore = new Map();
const RATE_LIMIT = 100; // requests
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    } else {
        const data = rateLimitStore.get(ip);
        
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + RATE_WINDOW;
        } else {
            data.count++;
        }
        
        if (data.count > RATE_LIMIT) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.'
            });
        }
    }
    
    next();
};

// --- Clean up rate limit store periodically ---
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore) {
        if (now > data.resetTime) {
            rateLimitStore.delete(ip);
        }
    }
}, 60 * 1000); // Clean up every minute

// --- Middleware Setup ---
app.use(securityHeaders);
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || true,
    credentials: false
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(rateLimiter);

// Serve static files
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// --- Data Directory Setup ---
const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- Helper Functions ---
const readMessages = () => {
    try {
        if (fs.existsSync(MESSAGES_FILE)) {
            const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading messages:', err.message);
    }
    return [];
};

const writeMessage = (message) => {
    const messages = readMessages();
    messages.push(message);
    
    // Keep only last 100 messages
    if (messages.length > 100) {
        messages.shift();
    }
    
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

// --- Input Validation ---
const validators = {
    name: (value) => {
        if (!value || typeof value !== 'string') return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 100) return 'Name is too long (max 100)';
        if (/[<>\"'&]/.test(value)) return 'Name contains invalid characters';
        return null;
    },
    
    email: (value) => {
        if (!value || typeof value !== 'string') return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        if (value.length > 100) return 'Email is too long (max 100)';
        return null;
    },
    
    message: (value) => {
        if (!value || typeof value !== 'string') return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        if (value.trim().length > 2000) return 'Message is too long (max 2000)';
        return null;
    }
};

const sanitize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
};

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Validate inputs
    const errors = [];
    const nameError = validators.name(name);
    const emailError = validators.email(email);
    const messageError = validators.message(message);
    
    if (nameError) errors.push(nameError);
    if (emailError) errors.push(emailError);
    if (messageError) errors.push(messageError);
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: errors.join('. ')
        });
    }
    
    // Sanitize and save
    const sanitizedMessage = {
        name: sanitize(name),
        email: email.toLowerCase().trim(),
        message: sanitize(message),
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress
    };
    
    try {
        writeMessage(sanitizedMessage);
        
        console.log(`[${new Date().toISOString()}] New message from: ${sanitizedMessage.name} <${sanitizedMessage.email}>`);
        
        res.json({
            success: true,
            message: 'Message received! I\'ll get back to you soon.'
        });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to save message. Please try again.'
        });
    }
});

// Get messages (protected - for admin use)
app.get('/api/messages', (req, res) => {
    // In production, add authentication here
    const authHeader = req.headers.authorization;
    
    // Simple token check (in production, use proper auth)
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken && authHeader !== `Bearer ${adminToken}`) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }
    
    try {
        const messages = readMessages();
        res.json({
            success: true,
            count: messages.length,
            messages: messages.reverse() // Newest first
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve messages'
        });
    }
});

// --- SPA Fallback ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Error Handling ---
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`
╭──────────────────────────────────────╮
│                                      │
│   🚀 Portfolio Server Running        │
│   Port: ${PORT.toString().padEnd(30)}│
│   Mode: ${(process.env.NODE_ENV || 'development').padEnd(30)}│
│                                      │
│   http://localhost:${PORT}${PORT === 3000 ? '' : '    '}             │
│                                      │
╰──────────────────────────────────────╯
`);
});

module.exports = app;
