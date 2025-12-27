import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Supabase Client initialisieren
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Middleware
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000', 'https://vip-shop-jade.vercel.app'],
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
            status TEXT DEFAULT 'pending',
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
  
  if (!adminSecret || adminSecret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// ==================== ROUTES ====================

// 1. POST /order - Bestellung erstellen
app.post('/order', async (req, res) => {
  try {
    const { product_name, payment_method, code, telegram_username } = req.body;

    // Validierung
    if (!product_name || !payment_method || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields: product_name, payment_method, code' 
      });
    }

    if (!telegram_username || telegram_username.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Telegram username is required' 
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

    // Erstelle neue Bestellung (ohne Code zu markieren)
    const orderId = uuidv4();
    const now = new Date().toISOString();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: orderId,
        product_name,
        payment_method: payment_method.toLowerCase(),
        code,
        telegram_username: telegram_username.trim(),
        status: 'pending',
        created_at: now,
        updated_at: now
      }])
      .select();

    if (orderError) {
      if (orderError.message && orderError.message.includes('unique')) {
        return res.status(409).json({ 
          error: 'Code already used' 
        });
      }
      console.error('DB Error:', orderError);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      success: true,
      order_id: orderId,
      message: 'Order created successfully. Waiting for verification.',
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
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update({ status: 'rejected', updated_at: now })
      .eq('id', id);

    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Überprüfe ob Bestellung existiert
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', id)
      .single();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order rejected',
      order_id: id,
      status: 'rejected'
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
