// WICHTIG: dotenv MUSS mit require geladen werden, damit config() vor den ES6 Imports ausgeführt wird
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

import {
  sendInitialOrderEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendCompletionEmail
} from './email-service.js';

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Supabase Client initialisieren
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein!');
  process.exit(1);
}

if (!RECAPTCHA_SECRET_KEY) {
  console.error('❌ Fehler: RECAPTCHA_SECRET_KEY muss gesetzt sein!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Middleware
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000', 'https://vip-shop-jade.vercel.app', 'https://vipshop.cloud'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret']
}));
app.use(express.json());

// ==================== DATABASE INITIALIZATION ====================

const initializeDatabase = async () => {
  try {
    // Überprüfe ob Tabellen existieren, erstelle sie falls nicht
    
    // Tabelle: orders
    const { error: ordersError } = await supabase.from('orders').select('count', { count: 'exact', head: true });
    
    if (ordersError && ordersError.code === 'PGRST116') {
      // Tabelle existiert nicht, erstelle sie
      console.log('Erstelle orders Tabelle...');
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            product_name TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            telegram_username TEXT,
            customer_email TEXT,
            status TEXT DEFAULT 'pending',
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `
      }).catch(() => ({ error: null })); // RPC might not exist, that's ok
    }

    // Tabelle: used_codes
    const { error: codesError } = await supabase.from('used_codes').select('count', { count: 'exact', head: true });
    
    if (codesError && codesError.code === 'PGRST116') {
      // Tabelle existiert nicht, erstelle sie
      console.log('Erstelle used_codes Tabelle...');
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS used_codes (
            code TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id)
          )
        `
      }).catch(() => ({ error: null })); // RPC might not exist, that's ok
    }

    console.log('✓ Supabase Datenbank initialisiert');
  } catch (error) {
    console.error('Fehler beim Initialisieren der Datenbank:', error);
    throw error;
  }
};

// Admin-Authentifizierung Middleware
const authenticateAdmin = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'];
  
  console.log('[DEBUG Auth] Received secret:', adminSecret);
  console.log('[DEBUG Auth] Expected secret:', ADMIN_SECRET);
  console.log('[DEBUG Auth] Match:', adminSecret === ADMIN_SECRET);
  
  if (!adminSecret || adminSecret !== ADMIN_SECRET) {
    console.log('[DEBUG Auth] ❌ Authentication failed');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  console.log('[DEBUG Auth] ✓ Authentication successful');
  next();
};

// ==================== ROUTES ====================

// ==================== RATE LIMITING & EMAIL VERIFICATION ====================

// In-memory storage for rate limiting and verification codes
const rateLimitStore = {}; // { ip: { count: 0, resetTime: timestamp } }
const verificationCodeStore = {}; // { email: { code: '123456', expiresAt: timestamp, orderId: 'xxx' } }

// Rate limiting: Max 5 orders per IP per hour
const checkRateLimit = (ip) => {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, resetTime: now + hour };
    return { allowed: true };
  }
  
  if (now > rateLimitStore[ip].resetTime) {
    rateLimitStore[ip] = { count: 1, resetTime: now + hour };
    return { allowed: true };
  }
  
  if (rateLimitStore[ip].count >= 5) {
    return { 
      allowed: false, 
      message: 'Zu viele Bestellungsversuche. Bitte warten Sie eine Stunde.' 
    };
  }
  
  rateLimitStore[ip].count++;
  return { allowed: true };
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code, orderId) => {
  try {
    await sendInitialOrderEmail(email, orderId, 'VIP Shop Order Verification');
    
    // For now, log the code (in production, this would be in the email)
    console.log(`[Verification] Email: ${email}, Code: ${code}, Order: ${orderId}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// 1. POST /order - Erstelle TEMP Order und sende Verification Code (NICHT in DB!)
app.post('/order', async (req, res) => {
  try {
    const { product_name, payment_method, code, telegram_username, customer_email } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: rateLimitCheck.message 
      });
    }

    // Validierung
    if (!product_name || !payment_method || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields: product_name, payment_method, code' 
      });
    }

    if (!customer_email || customer_email.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Customer email is required' 
      });
    }

    if (!['paysafecard', 'cryptovoucher'].includes(payment_method.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid payment_method. Must be paysafecard or cryptovoucher' 
      });
    }

    // Prüfe ob Code bereits verwendet wurde
    const { data: existingCode, error: checkError } = await supabase
      .from('used_codes')
      .select('code')
      .eq('code', code)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('DB Error:', checkError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingCode) {
      return res.status(409).json({ 
        error: 'Code already used' 
      });
    }

    // Generate Order ID and verification code
    const orderId = uuidv4();
    const verificationCode = generateVerificationCode();
    
    // Store temporary order info (NOT in database yet!)
    verificationCodeStore[customer_email.trim()] = {
      code: verificationCode,
      expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
      orderId: orderId,
      product_name: product_name,
      payment_method: payment_method.toLowerCase(),
      code: code,
      telegram_username: telegram_username.trim(),
      customer_email: customer_email.trim()
    };

    console.log(`[Order] Temporary order created for ${customer_email.trim()}: ${orderId}`);
    console.log(`[Order] Verification code: ${verificationCode}`);

    // Send verification email
    try {
      await sendInitialOrderEmail(customer_email.trim(), orderId, product_name);
      console.log(`[Order] Verification email sent to ${customer_email.trim()}`);
    } catch (emailError) {
      console.error('Warning: Could not send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      order_id: orderId,
      message: `Order created. Verification code sent to your email. (Test code: ${verificationCode})`,
      verification_code: verificationCode, // For development/testing only
      status: 'pending_verification'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1.5 POST /verify-code - Verifikationscode überprüfen und Order in DB speichern
app.post('/verify-code', async (req, res) => {
  try {
    const { customer_email, verification_code } = req.body;

    if (!customer_email || !verification_code) {
      return res.status(400).json({ 
        error: 'Email and verification code required' 
      });
    }

    const storedData = verificationCodeStore[customer_email.trim()];

    if (!storedData) {
      return res.status(400).json({ 
        error: 'No verification code found for this email' 
      });
    }

    if (Date.now() > storedData.expiresAt) {
      delete verificationCodeStore[customer_email.trim()];
      return res.status(400).json({ 
        error: 'Verification code expired. Please create a new order.' 
      });
    }

    if (storedData.code !== verification_code.trim()) {
      return res.status(400).json({ 
        error: 'Invalid verification code' 
      });
    }

    // Code is valid! Now save the order to database with status 'pending'
    const orderId = storedData.orderId;
    const now = new Date().toISOString();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: orderId,
        product_name: storedData.product_name,
        payment_method: storedData.payment_method,
        code: storedData.code,
        telegram_username: storedData.telegram_username,
        customer_email: storedData.customer_email,
        status: 'pending',
        created_at: now,
        updated_at: now
      }])
      .select();

    if (orderError) {
      console.error('DB Error:', orderError);
      return res.status(500).json({ error: 'Database error while saving order' });
    }

    console.log(`[Verify] Order verified and saved to database: ${orderId}`);

    // Clean up verification code
    delete verificationCodeStore[customer_email.trim()];

    res.json({
      success: true,
      order_id: orderId,
      message: 'Email verified successfully. Order saved and pending approval.',
      status: 'pending'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /order/:id - Bestellungsstatus abrufen
app.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Order not found' });
      }
      console.error('DB Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      order_id: order.id,
      product_name: order.product_name,
      payment_method: order.payment_method,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. GET /admin/orders - Alle Bestellungen (Admin kann filtern)
app.get('/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const status = req.query.status;

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Wenn status Parameter übergeben wird, filtern
    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. POST /admin/approve/:id - Bestellung genehmigen (Admin)
app.post('/admin/approve/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    // Hole die Bestellung
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update Status auf "approved"
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'approved', updated_at: now })
      .eq('id', id);

    if (updateError) {
      console.error('DB Error:', updateError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Send approval email
    try {
      await sendApprovalEmail(order.customer_email, id, order.product_name);
    } catch (emailError) {
      console.error('Warning: Could not send approval email:', emailError);
    }

    res.json({
      success: true,
      message: 'Order approved',
      order_id: id,
      status: 'approved'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. POST /admin/finish/:id - Bestellung als "finished" markieren (Code wird gültig)
app.post('/admin/finish/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    // Hole die Bestellung
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update Status auf "finished"
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'finished', updated_at: now })
      .eq('id', id);

    if (updateError) {
      console.error('DB Error:', updateError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Speichere Code als verwendet
    const { error: codeError } = await supabase
      .from('used_codes')
      .insert([{
        code: order.code,
        order_id: id
      }]);

    if (codeError) {
      console.error('DB Error:', codeError);
      return res.status(500).json({ error: 'Failed to mark code as used' });
    }

    // Send completion email with code
    // COMMENTED OUT: No email should be sent when finishing an order
    // try {
    //   await sendCompletionEmail(order.customer_email, id, order.product_name, order.code);
    // } catch (emailError) {
    //   console.error('Warning: Could not send completion email:', emailError);
    // }

    res.json({
      success: true,
      message: 'Order finished and code marked as used',
      order_id: id,
      status: 'finished',
      code: order.code
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. POST /admin/reject/:id - Bestellung ablehnen (Admin)
app.post('/admin/reject/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const now = new Date().toISOString();

    // Hole die Bestellung zuerst
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'rejected', rejection_reason: reason || '', updated_at: now })
      .eq('id', id);

    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Send rejection email
    try {
      await sendRejectionEmail(order.customer_email, id, order.product_name, reason || 'Keine Details angegeben');
    } catch (emailError) {
      console.error('Warning: Could not send rejection email:', emailError);
    }

    res.json({
      success: true,
      message: 'Order rejected',
      order_id: id,
      status: 'rejected',
      reason: reason || null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== TEST ROUTES (Development Only) ====================

// Test email sending (Admin only)
app.post('/admin/test-email', authenticateAdmin, async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }

    console.log(`\n🧪 Testing email send to: ${email}`);

    let success = false;

    if (type === 'initial') {
      success = await sendInitialOrderEmail(email, 'TEST-ORDER-ID-123', 'Gold');
    } else if (type === 'approval') {
      success = await sendApprovalEmail(email, 'TEST-ORDER-ID-123', 'Gold');
    } else if (type === 'completion') {
      success = await sendCompletionEmail(email, 'TEST-ORDER-ID-123', 'Gold', 'TEST-CODE-12345');
    } else if (type === 'rejection') {
      success = await sendRejectionEmail(email, 'TEST-ORDER-ID-123', 'Gold', 'Test rejection reason');
    } else {
      return res.status(400).json({ error: 'Invalid email type. Use: initial, approval, completion, rejection' });
    }

    res.json({
      success,
      message: success ? 'Email sent successfully (check logs)' : 'Failed to send email (check logs)',
      email,
      type
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ==================== SERVER START ====================

const startServer = async () => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════╗
║    VIP SHOP BACKEND - ONLINE       ║
╠════════════════════════════════════╣
║ Server läuft auf Port ${PORT}         ║
║ Datenbank: Supabase                ║
║ Mode: ${process.env.NODE_ENV}        ║
╚════════════════════════════════════╝
      `);
      console.log('Verfügbare Endpoints:');
      console.log('  POST   /order');
      console.log('  GET    /order/:id');
      console.log('  GET    /admin/orders (Admin)');
      console.log('  POST   /admin/approve/:id (Admin)');
      console.log('  POST   /admin/finish/:id (Admin)');
      console.log('  POST   /admin/reject/:id (Admin)');
      console.log('  GET    /health');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
