import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ==================== INITIALIZE DATABASE ====================

export async function initializeTelegramDatabase() {
  try {
    // Create telegram_users table if it doesn't exist
    const { data, error } = await supabase.from('telegram_users').select('count', { count: 'exact', head: true });
    
    if (error && error.code === 'PGRST116') {
      console.log('Creating telegram_users table...');
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS telegram_users (
            chat_id BIGINT PRIMARY KEY,
            telegram_id TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `
      }).catch(() => ({ error: null }));
    }

    console.log('✓ Telegram users table ready');
    return true;
  } catch (error) {
    console.error('Error initializing telegram_users table:', error);
    return true; // Don't fail startup
  }
}

// ==================== STORE USER MAPPING ====================

export async function storeTelegramUser(chatId, telegramId) {
  try {
    const { error } = await supabase
      .from('telegram_users')
      .upsert(
        {
          chat_id: chatId,
          telegram_id: telegramId,
          created_at: new Date().toISOString()
        },
        { onConflict: 'chat_id' }
      );

    if (error) {
      console.error('DB Error:', error);
      return false;
    }

    console.log(`✓ Stored Telegram user: ${telegramId} (Chat ID: ${chatId})`);
    return true;
  } catch (error) {
    console.error('Error storing user:', error);
    return false;
  }
}

// ==================== GET CHAT ID FROM TELEGRAM ID ====================

export async function getChatIdByTelegramId(telegramId) {
  try {
    const { data, error } = await supabase
      .from('telegram_users')
      .select('chat_id')
      .eq('telegram_id', telegramId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.chat_id;
  } catch (error) {
    console.error('Error getting chat ID:', error);
    return null;
  }
}

// ==================== PROCESS TELEGRAM UPDATE ====================

export async function processTelegramUpdate(update) {
  try {
    const message = update.message;
    
    if (!message || !message.from) {
      return;
    }

    const chatId = message.chat.id;
    const telegramId = message.from.id;
    const text = message.text || '';

    // Store user mapping
    await storeTelegramUser(chatId, telegramId);
    
    // Handle /start command
    if (text === '/start') {
      const welcomeMessage = `
🎉 <b>Willkommen beim VIP Shop Bot!</b>

Du erhältst hier Benachrichtigungen über:
✅ Bestellungsbestätigung
✅ Bestellungsgenehmigung
✅ Zugang zur VIP-Gruppe
❌ Ablehnung mit Grund

<i>Halte diesen Chat offen, um Nachrichten zu erhalten!</i>
      `;
      
      await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: chatId,
        text: welcomeMessage,
        parse_mode: 'HTML'
      });
    }
  } catch (error) {
    console.error('Error processing Telegram update:', error);
  }
}
