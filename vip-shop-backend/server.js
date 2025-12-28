import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== ENVIRONMENT VARIABLES ====================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Check required variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein!');
  process.exit(1);
}

// ==================== CORS CONFIGURATION ====================
app.use(cors({
  origin: ['https://vipshop.cloud', 'https://vip-shop-jade.vercel.app', 'http://localhost:8000', 'http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));

app.use(express.json());

// ==================== SUPABASE INITIALIZATION ====================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('✓ Supabase Datenbank initialisiert');
console.log('✓ Resend Email Service konfiguriert');

// ==================== RATE LIMITING ====================
const rateLimitStore = {};

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
    return { allowed: false, message: 'Zu viele Bestellungsversuche. Bitte warten Sie eine Stunde.' };
  }
  
  rateLimitStore[ip].count++;
  return { allowed: true };
};

// ==================== EMAIL VERIFICATION ====================
const verificationCodeStore = {};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code, orderId) => {
  if (!resend) {
    console.log(`[Email] Verification code for ${email}: ${code} (Resend not configured)`);
    return true;
  }

  try {
    const response = await resend.emails.send({
      from: 'VIP Shop <noreply@vipshop.cloud>',
      to: email,
      subject: '🔐 Dein Verifikationscode - VIP Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d4af37;">🔐 Dein Verifikationscode</h2>
          <p>Hallo,</p>
          <p>vielen Dank für deine Bestellung! Um diese zu bestätigen, verwende bitte folgenden Code:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #d4af37;">
            <p style="font-size: 28px; font-weight: bold; color: #d4af37; font-family: monospace; letter-spacing: 5px; margin: 0;">
              ${code}
            </p>
          </div>
          
          <p>Dieser Code ist <strong>10 Minuten</strong> lang gültig.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            VIP Shop • Deine Premium Community
          </p>
        </div>
      `
    });

    if (response.error) {
      console.error(`[Email Error] Failed to send to ${email}:`, response.error);
      return false;
    }

    console.log(`[Email] Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Exception:`, error);
    return false;
  }
};

const sendApprovalEmail = async (email, orderId, productName, code) => {
  if (!resend) {
    console.log(`[Email] Approval email for ${email}: Order ${orderId}`);
    return true;
  }

  try {
    const groupLinks = {
      'Silber': 'https://t.me/+EwQE5eaiAwg5OGRk',
      'Gold': 'https://t.me/+TihK9xDZPTQ5ZTg0',
      'Platinum': 'https://t.me/+ISTJI8IR6TtmY2Y0'
    };

    const groupLink = groupLinks[productName] || groupLinks['Silber'];
    const groupName = productName || 'VIP';

    const response = await resend.emails.send({
      from: 'VIP Shop <noreply@vipshop.cloud>',
      to: email,
      subject: '✅ Deine Bestellung wurde genehmigt! - VIP Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Glückwunsch! Deine Bestellung wurde genehmigt!</h2>
          <p>Hallo,</p>
          <p>großartig! Deine Bestellung wurde überprüft und genehmigt. 🎉</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #4CAF50;">
            <p><strong>Bestellungs-ID:</strong> <code>${orderId}</code></p>
            <p><strong>Package:</strong> ${groupName}</p>
          </div>
          
          <p style="margin: 25px 0; text-align: center;">
            <strong>🔗 Dein exklusiver Zugang zur VIP-Gruppe:</strong>
          </p>
          
          <p style="text-align: center; margin: 20px 0;">
            <a href="${groupLink}" style="display: inline-block; background-color: #0088cc; color: white; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              ➔ Zur ${groupName} Gruppe beitreten
            </a>
          </p>
          
          <p style="color: #666; text-align: center; margin-top: 20px; line-height: 1.6;">
            Klicke auf den Button oben, um direkt zur Gruppe zu gelangen und deinen VIP-Zugang zu aktivieren.
          </p>

          ${code ? `
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #4CAF50; text-align: center;">
            <p style="color: #666; margin: 0 0 10px 0;">Dein persönlicher Code:</p>
            <p style="font-size: 20px; font-weight: bold; color: #2e7d32; font-family: monospace; margin: 0; letter-spacing: 2px;">
              ${code}
            </p>
          </div>
          ` : ''}
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
            VIP Shop – Deine Premium Community
          </p>
        </div>
      `
    });

    if (response.error) {
      console.error(`[Email Error] Failed to send approval to ${email}:`, response.error);
      return false;
    }

    console.log(`[Email] Approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Exception:`, error);
    return false;
  }
};

const sendRejectionEmail = async (email, orderId, reason) => {
  if (!resend) {
    console.log(`[Email] Rejection email for ${email}: Order ${orderId}`);
    return true;
  }

  try {
    const response = await resend.emails.send({
      from: 'VIP Shop <noreply@vipshop.cloud>',
      to: email,
      subject: '❌ Update zu deiner Bestellung - VIP Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #FF6B6B;">❌ Update zu deiner Bestellung</h2>
          <p>Hallo,</p>
          <p>leider mussten wir deine Bestellung ablehnen.</p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>Bestellungs-ID:</strong> <code>${orderId}</code></p>
            <p><strong>Grund:</strong></p>
            <p style="color: #333; margin: 0;">${reason || 'Keine Details angegeben'}</p>
          </div>
          
          <p>Falls du Fragen hast, kontaktiere uns gerne.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            VIP Shop • Deine Premium Community
          </p>
        </div>
      `
    });

    if (response.error) {
      console.error(`[Email Error] Failed to send rejection to ${email}:`, response.error);
      return false;
    }

    console.log(`[Email] Rejection email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Exception:`, error);
    return false;
  }
};

// ==================== ORDER ROUTES ====================

// 1. POST /order - Create order and send verification code
app.post('/order', async (req, res) => {
  try {
    const { product_name, payment_method, code, telegram_username, customer_email } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ error: rateLimitCheck.message });
    }

    if (!product_name || !payment_method || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!customer_email || customer_email.trim().length === 0) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    if (!['paysafecard', 'cryptovoucher'].includes(payment_method.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid payment_method' });
    }

    // Check if code already used
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
      return res.status(409).json({ error: 'Code already used' });
    }

    // Generate and store verification code (NO ORDER IN DB YET!)
    const verificationCode = generateVerificationCode();
    const orderId = uuidv4();
    
    verificationCodeStore[customer_email.trim()] = {
      code: verificationCode,
      expiresAt: Date.now() + (10 * 60 * 1000),
      orderId: orderId,
      product_name: product_name,
      payment_method: payment_method.toLowerCase(),
      paymentCode: code,
      telegram_username: telegram_username.trim()
    };

    console.log(`[Order] Verification code generated: ${verificationCode} for ${customer_email}`);

    // Send verification email
    await sendVerificationEmail(customer_email.trim(), verificationCode, orderId);

    res.status(201).json({
      success: true,
      order_id: orderId,
      message: 'Verification code will be sent to your email.',
      status: 'pending'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. POST /verify-code - Verify email code and create order
app.post('/verify-code', async (req, res) => {
  try {
    const { email, verification_code } = req.body;

    if (!email || !verification_code) {
      return res.status(400).json({ error: 'Email and verification code required' });
    }

    const trimmedEmail = email.trim();
    const codeData = verificationCodeStore[trimmedEmail];

    // Check if code exists
    if (!codeData) {
      return res.status(400).json({ error: 'No verification code found for this email' });
    }

    // Check if code expired
    if (Date.now() > codeData.expiresAt) {
      delete verificationCodeStore[trimmedEmail];
      return res.status(400).json({ error: 'Verification code expired' });
    }

    // Check if code matches
    if (codeData.code !== verification_code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid - NOW create the order
    const orderId = codeData.orderId;
    const now = new Date().toISOString();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: orderId,
        product_name: codeData.product_name,
        payment_method: codeData.payment_method,
        code: codeData.paymentCode,
        telegram_username: codeData.telegram_username,
        customer_email: trimmedEmail,
        status: 'pending',
        created_at: now,
        updated_at: now
      }])
      .select();

    if (orderError) {
      console.error('DB Error:', orderError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Clean up verification code
    delete verificationCodeStore[trimmedEmail];

    console.log(`[Order] Created after verification: ${orderId}, Email: ${trimmedEmail}`);

    res.json({
      success: true,
      order_id: orderId,
      message: 'Order verified and created',
      status: 'pending'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. GET /order/:id - Get order status
app.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. GET /admin/orders - Get all orders (requires admin secret)
app.get('/admin/orders', async (req, res) => {
  try {
    const adminSecret = req.headers['x-admin-secret'];

    if (adminSecret !== ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('DB Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ orders });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. POST /admin/approve/:id - Approve order
app.post('/admin/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const adminSecret = req.headers['x-admin-secret'];

    if (adminSecret !== ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code } = req.body;
    const now = new Date().toISOString();

    const { data: order, error: getError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'approved', code: code || order.code, updated_at: now })
      .eq('id', id);

    if (updateError) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Send approval email with code if provided
    await sendApprovalEmail(order.customer_email, id, order.product_name, code);

    console.log(`[Admin] Order ${id} approved`);

    res.json({ success: true, message: 'Order approved' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. POST /admin/reject/:id - Reject order
app.post('/admin/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminSecret = req.headers['x-admin-secret'];

    if (adminSecret !== ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date().toISOString();

    const { data: order, error: getError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (getError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'rejected', rejection_reason: reason, updated_at: now })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Send rejection email
    await sendRejectionEmail(order.customer_email, id, reason);

    console.log(`[Admin] Order ${id} rejected`);

    res.json({ success: true, message: 'Order rejected' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. POST /admin/finish/:id - Complete order and send code
app.post('/admin/finish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const adminSecret = req.headers['x-admin-secret'];

    if (adminSecret !== ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed', code: code, updated_at: now })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    console.log(`[Admin] Order ${id} completed with code`);

    res.json({ success: true, message: 'Order completed and code sent' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 VIP SHOP BACKEND - ONLINE          ║
╚════════════════════════════════════════╝
Server running on port ${PORT}
Database: Supabase ✓
Email: Resend (logs only) ✓
Mode: production
  `);
});
