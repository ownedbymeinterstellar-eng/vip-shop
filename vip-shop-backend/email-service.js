import nodemailer from 'nodemailer';
import { createRequire } from 'module';

// Lade dotenv direkt in diesem Modul
const require = createRequire(import.meta.url);
require('dotenv').config();

// Dynamisches Laden der Konfiguration (wird bei jedem Aufruf neu geprüft)
function getEmailConfig() {
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;
  const from = process.env.EMAIL_FROM || user;
  
  console.log('[DEBUG] getEmailConfig called:');
  console.log('  EMAIL_USER from process.env:', user);
  console.log('  EMAIL_PASSWORD exists:', !!password);
  console.log('  EMAIL_FROM from process.env:', from);
  
  return { user, password, from };
}

// Log email configuration status at startup
const initialConfig = getEmailConfig();
if (!initialConfig.user || !initialConfig.password) {
  console.warn('📧 Email Service: Missing credentials (EMAIL_USER or EMAIL_PASSWORD not set)');
  console.warn(`   EMAIL_USER: ${initialConfig.user ? 'SET' : 'NOT SET'}`);
  console.warn(`   EMAIL_PASSWORD: ${initialConfig.password ? 'SET' : 'NOT SET'}`);
} else {
  console.log('✅ Email Service: Configured and ready');
  console.log(`   EMAIL_USER: ${initialConfig.user}`);
  console.log(`   EMAIL_FROM: ${initialConfig.from}`);
}

// Konfiguriere Nodemailer
// Für Gmail: https://myaccount.google.com/apppasswords
function createTransporter() {
  const config = getEmailConfig();
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: config.user,
      pass: config.password
    }
  });
}

// ==================== SEND EMAIL ====================

export async function sendEmail(to, subject, html) {
  try {
    const config = getEmailConfig();
    
    if (!config.user || !config.password) {
      console.warn('📧 Email not configured - skipping email send to', to);
      console.warn('   Make sure EMAIL_USER and EMAIL_PASSWORD are set in environment variables');
      return false;
    }

    const mailOptions = {
      from: config.from,
      to,
      subject,
      html
    };

    console.log(`📨 Sending email to ${to} with subject: "${subject}"`);
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`);
    console.error(`   Subject: ${subject}`);
    console.error(`   Error: ${error.message}`);
    if (error.code) console.error(`   Code: ${error.code}`);
    return false;
  }
}

// ==================== INITIAL ORDER EMAIL ====================

export async function sendInitialOrderEmail(customerEmail, orderId, productName) {
  const subject = '📦 Deine Bestellung wurde erhalten - VIP Shop';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #00d4ff;">📬 Deine Bestellung wurde erhalten!</h2>
      
      <p>Hallo,</p>
      
      <p>vielen Dank für deine Bestellung bei VIP Shop! Wir freuen uns auf dich.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Bestellungs-ID:</strong> <code>${orderId}</code></p>
        <p><strong>Produkt:</strong> ${productName}</p>
      </div>
      
      <p style="color: #666;">⏳ Deine Bestellung wird gerade überprüft. Du erhältst eine Benachrichtigung per Email, sobald deine Bestellung genehmigt wurde.</p>
      
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        Wenn du diese Bestellung nicht aufgegeben hast, ignoriere diese Email bitte.
      </p>
      
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        VIP Shop – Deine Premium Community
      </p>
    </div>
  `;

  return sendEmail(customerEmail, subject, html);
}

// ==================== APPROVAL EMAIL WITH GROUP LINK ====================

export async function sendApprovalEmail(customerEmail, orderId, productName) {
  const subject = '✅ Deine Bestellung wurde genehmigt! - VIP Shop';
  
  const groupLinks = {
    'Silber': 'https://t.me/+EwQE5eaiAwg5OGRk',
    'Gold': 'https://t.me/+TihK9xDZPTQ5ZTg0',
    'Platinum': 'https://t.me/+ISTJI8IR6TtmY2Y0'
  };

  const groupLink = groupLinks[productName] || '';
  const groupName = productName || 'VIP';

  if (!groupLink) {
    console.warn(`⚠️ Warning: No group link found for product: ${productName}`);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4CAF50;">✅ Glückwunsch! Deine Bestellung wurde genehmigt!</h2>
      
      <p>Hallo,</p>
      
      <p>großartig! Deine Bestellung wurde überprüft und genehmigt. 🎉</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Bestellungs-ID:</strong> <code>${orderId}</code></p>
        <p><strong>Produkt:</strong> ${groupName}</p>
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
      
      <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
        VIP Shop – Deine Premium Community
      </p>
    </div>
  `;

  return sendEmail(customerEmail, subject, html);
}

// ==================== REJECTION EMAIL WITH REASON ====================

export async function sendRejectionEmail(customerEmail, orderId, productName, reason) {
  const subject = '⚠️ Update zu deiner Bestellung - VIP Shop';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #FF6B6B;">⚠️ Update zu deiner Bestellung</h2>
      
      <p>Hallo,</p>
      
      <p>leider mussten wir deine Bestellung ablehnen.</p>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p><strong>Bestellungs-ID:</strong> <code>${orderId}</code></p>
        <p><strong>Produkt:</strong> ${productName}</p>
        <p><strong>Grund:</strong></p>
        <p style="color: #333; font-size: 14px;">${reason || 'Keine Details angegeben'}</p>
      </div>
      
      <p style="margin-top: 20px; font-size: 14px;">Falls du Fragen hast oder mehr Informationen benötigst, kontaktiere uns gerne auf Telegram:</p>
      
      <p style="text-align: center; margin: 20px 0;">
        <a href="https://t.me/Leonax3" style="display: inline-block; background-color: #0088cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
          💬 Kontaktiere uns auf Telegram
        </a>
      </p>
      
      <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
        VIP Shop – Deine Premium Community
      </p>
    </div>
  `;

  return sendEmail(customerEmail, subject, html);
}

// ==================== COMPLETION EMAIL WITH CODE ====================

export async function sendCompletionEmail(customerEmail, orderId, productName, code) {
  const subject = '🎁 Dein Code ist bereit! - VIP Shop';
  
  const groupLinks = {
    'Silber': 'https://t.me/+EwQE5eaiAwg5OGRk',
    'Gold': 'https://t.me/+TihK9xDZPTQ5ZTg0',
    'Platinum': 'https://t.me/+ISTJI8IR6TtmY2Y0'
  };

  const groupLink = groupLinks[productName];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4CAF50;">🎁 Dein Code ist bereit!</h2>
      
      <p>Hallo,</p>
      
      <p>perfekt! Dein Code für dein VIP-Zugang ist jetzt bereit.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Bestellungs-ID:</strong> <code>${orderId}</code></p>
        <p><strong>Produkt:</strong> ${productName}</p>
      </div>
      
      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4CAF50; text-align: center;">
        <p style="color: #666; margin: 0 0 10px 0;">Dein persönlicher Code:</p>
        <p style="font-size: 28px; font-weight: bold; color: #2e7d32; font-family: monospace; margin: 0; letter-spacing: 2px;">
          ${code}
        </p>
      </div>
      
      <p style="margin: 25px 0; text-align: center;">
        <strong>🔗 Tritt jetzt unserer VIP Gruppe bei:</strong>
      </p>
      
      <p style="text-align: center; margin: 20px 0;">
        <a href="${groupLink}" style="display: inline-block; background-color: #0088cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Zur VIP Gruppe
        </a>
      </p>
      
      <p style="color: #666; margin-top: 20px; font-size: 14px;">
        Nutze deinen Code beim Login in der Gruppe. Willkommen im VIP-Kreis! 🙏
      </p>
      
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        VIP Shop – Deine Premium Community
      </p>
    </div>
  `;

  return sendEmail(customerEmail, subject, html);
}
