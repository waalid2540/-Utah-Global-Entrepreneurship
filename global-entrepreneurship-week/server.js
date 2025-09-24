import express from 'express';
import Database from 'better-sqlite3';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import Stripe from 'stripe';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database('gew-events.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    ticket_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_in BOOLEAN DEFAULT FALSE,
    stripe_payment_intent TEXT,
    unique_id TEXT UNIQUE NOT NULL
  )
`);

// Initialize Stripe if configured
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Initialize email transporter if SMTP is configured
let transporter;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Rate limiting for registration
const registrationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many registration attempts, please try again later.'
});

// Input validation middleware
function validateRegistration(req, res, next) {
  const { name, email, ticket_type } = req.body;
  
  if (!name || !validator.isLength(name.trim(), { min: 1, max: 100 })) {
    return res.status(400).json({ error: 'Valid name is required' });
  }
  
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  
  if (!ticket_type || !['general', 'vip', 'speaker', 'sponsor'].includes(ticket_type.toLowerCase())) {
    return res.status(400).json({ error: 'Valid ticket type is required' });
  }
  
  // Sanitize inputs
  req.body.name = validator.escape(name.trim());
  req.body.email = validator.normalizeEmail(email);
  req.body.phone = req.body.phone ? validator.escape(req.body.phone.trim()) : null;
  req.body.company = req.body.company ? validator.escape(req.body.company.trim()) : null;
  req.body.ticket_type = ticket_type.toLowerCase();
  
  next();
}

// Generate unique ID
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Routes

// Landing page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Registration endpoint
app.post('/register', registrationLimit, validateRegistration, async (req, res) => {
  try {
    const { name, email, phone, company, ticket_type } = req.body;
    const uniqueId = generateUniqueId();
    
    // Check if email already registered
    const existing = db.prepare('SELECT * FROM attendees WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // For VIP tickets, create Stripe checkout session if configured
    if (ticket_type === 'vip' && stripe && process.env.STRIPE_PRICE_ID) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.PUBLIC_BASE_URL}/ticket/${uniqueId}`,
        cancel_url: `${process.env.PUBLIC_BASE_URL}`,
        metadata: {
          name,
          email,
          phone: phone || '',
          company: company || '',
          ticket_type,
          unique_id: uniqueId
        }
      });
      
      return res.json({ checkout_url: session.url });
    }
    
    // For free tickets, create immediately
    const stmt = db.prepare(`
      INSERT INTO attendees (name, email, phone, company, ticket_type, unique_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, email, phone, company, ticket_type, uniqueId);
    
    // Send email if configured
    if (transporter && process.env.FROM_EMAIL) {
      try {
        const ticketUrl = `${process.env.PUBLIC_BASE_URL}/ticket/${uniqueId}`;
        const qrDataURL = await QRCode.toDataURL(ticketUrl);
        
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: email,
          subject: 'Global Entrepreneurship Week - Your Registration Confirmed',
          html: `
            <h2>Welcome to Global Entrepreneurship Week!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering for Global Entrepreneurship Week. Your ${ticket_type.toUpperCase()} registration is confirmed.</p>
            <p><strong>Event Details:</strong></p>
            <ul>
              <li>Date: November 18-24, 2024</li>
              <li>Location: ${process.env.EVENT_LOCATION || 'TBD'}</li>
              <li>Ticket ID: ${uniqueId}</li>
            </ul>
            <p><a href="${ticketUrl}">View your ticket and event details</a></p>
            <img src="cid:qr" alt="QR Code" style="display: block; margin: 20px auto;" />
            <p><em>Show this QR code at the event entrance</em></p>
          `,
          attachments: [{
            filename: 'gew-ticket-qr.png',
            content: qrDataURL.split(',')[1],
            encoding: 'base64',
            cid: 'qr'
          }]
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }
    
    res.json({ 
      success: true, 
      ticket_id: uniqueId,
      ticket_url: `/ticket/${uniqueId}`
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Ticket page
app.get('/ticket/:id', async (req, res) => {
  try {
    const attendee = db.prepare('SELECT * FROM attendees WHERE unique_id = ?').get(req.params.id);
    
    if (!attendee) {
      return res.status(404).send('Ticket not found');
    }
    
    const ticketUrl = `${process.env.PUBLIC_BASE_URL}/ticket/${req.params.id}`;
    const qrDataURL = await QRCode.toDataURL(ticketUrl);
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Global Entrepreneurship Week - ${attendee.name}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .ticket { 
            background: white;
            border-radius: 16px; 
            padding: 30px; 
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .logo { font-size: 2.5em; margin-bottom: 10px; }
          .event-title { color: #333; font-size: 1.8em; margin-bottom: 20px; }
          .attendee-name { color: #667eea; font-size: 1.5em; margin: 20px 0; }
          .details { text-align: left; margin: 20px 0; }
          .detail-item { margin: 8px 0; }
          .qr { margin: 30px 0; }
          .status { 
            padding: 12px 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .checked-in { background: #d4edda; color: #155724; }
          .not-checked-in { background: #fff3cd; color: #856404; }
          .footer { font-size: 0.9em; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="logo">🚀</div>
          <h1 class="event-title">Global Entrepreneurship Week</h1>
          <h2 class="attendee-name">${attendee.name}</h2>
          
          <div class="details">
            <div class="detail-item"><strong>Email:</strong> ${attendee.email}</div>
            ${attendee.company ? `<div class="detail-item"><strong>Company:</strong> ${attendee.company}</div>` : ''}
            <div class="detail-item"><strong>Ticket Type:</strong> ${attendee.ticket_type.toUpperCase()}</div>
            <div class="detail-item"><strong>Event Date:</strong> November 18-24, 2024</div>
            <div class="detail-item"><strong>Ticket ID:</strong> ${attendee.unique_id}</div>
          </div>
          
          <div class="status ${attendee.checked_in ? 'checked-in' : 'not-checked-in'}">
            ${attendee.checked_in ? '✅ CHECKED IN' : '⏳ READY FOR CHECK-IN'}
          </div>
          
          <div class="qr">
            <img src="${qrDataURL}" alt="Event QR Code" style="max-width: 200px;" />
          </div>
          
          <div class="footer">
            <p>Present this QR code at the event entrance</p>
            <p>Global Entrepreneurship Week 2024</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Ticket display error:', error);
    res.status(500).send('Error displaying ticket');
  }
});

// Admin authentication middleware
function requireAdmin(req, res, next) {
  const adminPass = req.headers.authorization?.replace('Bearer ', '');
  if (adminPass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Admin routes
app.get('/admin', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'admin.html'));
});

app.get('/api/admin/attendees', requireAdmin, (req, res) => {
  try {
    const { search, type, status } = req.query;
    let query = 'SELECT * FROM attendees';
    let params = [];
    let conditions = [];
    
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR unique_id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (type) {
      conditions.push('ticket_type = ?');
      params.push(type);
    }
    
    if (status === 'checked_in') {
      conditions.push('checked_in = TRUE');
    } else if (status === 'not_checked_in') {
      conditions.push('checked_in = FALSE');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const attendees = db.prepare(query).all(...params);
    res.json(attendees);
    
  } catch (error) {
    console.error('Admin attendees error:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

app.post('/api/admin/checkin/:id', requireAdmin, (req, res) => {
  try {
    const stmt = db.prepare('UPDATE attendees SET checked_in = NOT checked_in WHERE unique_id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Attendee not found' });
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

app.get('/api/admin/export', requireAdmin, (req, res) => {
  try {
    const attendees = db.prepare('SELECT name, email, company, ticket_type, created_at, checked_in FROM attendees ORDER BY created_at DESC').all();
    
    let csv = 'Name,Email,Company,Ticket Type,Created At,Checked In\\n';
    attendees.forEach(attendee => {
      csv += `"${attendee.name}","${attendee.email}","${attendee.company || ''}","${attendee.ticket_type}","${attendee.created_at}","${attendee.checked_in ? 'Yes' : 'No'}"\\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="gew-attendees.csv"');
    res.send(csv);
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Stripe webhook for payment confirmation
if (stripe) {
  app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { name, email, phone, company, ticket_type, unique_id } = session.metadata;
        
        // Create attendee record
        const stmt = db.prepare(`
          INSERT INTO attendees (name, email, phone, company, ticket_type, unique_id, stripe_payment_intent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(name, email, phone || null, company || null, ticket_type, unique_id, session.payment_intent);
        
        // Send email if configured
        if (transporter && process.env.FROM_EMAIL) {
          const ticketUrl = `${process.env.PUBLIC_BASE_URL}/ticket/${unique_id}`;
          QRCode.toDataURL(ticketUrl).then(qrDataURL => {
            transporter.sendMail({
              from: process.env.FROM_EMAIL,
              to: email,
              subject: 'Global Entrepreneurship Week - Payment Confirmed',
              html: `
                <h2>Payment Confirmed - Welcome to GEW!</h2>
                <p>Hello ${name},</p>
                <p>Your payment has been processed and your ${ticket_type.toUpperCase()} registration for Global Entrepreneurship Week is confirmed.</p>
                <p><strong>Ticket ID:</strong> ${unique_id}</p>
                <p><a href="${ticketUrl}">View your ticket</a></p>
                <img src="cid:qr" alt="QR Code" />
              `,
              attachments: [{
                filename: 'gew-ticket-qr.png',
                content: qrDataURL.split(',')[1],
                encoding: 'base64',
                cid: 'qr'
              }]
            }).catch(console.error);
          });
        }
      }
      
      res.json({ received: true });
      
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
}

// SEO routes
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${process.env.PUBLIC_BASE_URL}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
    </urlset>`);
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${process.env.PUBLIC_BASE_URL}/sitemap.xml`);
});

app.listen(PORT, () => {
  console.log(`🚀 Global Entrepreneurship Week site running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
});