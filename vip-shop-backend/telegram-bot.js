import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Group links with product names mapping
const GROUP_LINKS = {
  'VIP Bronze': {
    link: 'https://t.me/+EwQE5eaiAwg5OGRk',
    name: 'VIP Bronze'
  },
  'VIP Gold': {
    link: 'https://t.me/+eyPpy6JPWKNiYjNk',
    name: 'VIP Gold'
  },
  'VIP Platin': {
    link: 'https://t.me/+ISTJI8IR6TtmY2Y0',
    name: 'VIP Platin'
  }
};

// ==================== SEND MESSAGE BY USER ID ====================

export async function sendTelegramMessage(userId, message) {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: userId,
      text: message,
      parse_mode: 'HTML'
    });

    console.log(`✓ Message sent to user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error sending message to user ${userId}:`, error.message);
    return false;
  }
}

// ==================== INITIAL ORDER MESSAGE ====================

export async function sendInitialOrderMessage(userId, orderId, productName) {
  const message = `
🛍️ <b>Neue Bestellung erhalten!</b>

<b>Bestellungs-ID:</b> <code>${orderId}</code>
<b>Produkt:</b> ${productName}

⏳ <i>Deine Bestellung wird überprüft.</i>
⏰ <i>Du erhältst in 24-48 Stunden eine Benachrichtigung.</i>

Bitte warten...
  `;

  return sendTelegramMessage(userId, message);
}

// ==================== APPROVAL MESSAGE WITH GROUP LINK ====================

export async function sendApprovalMessage(userId, orderId, productName) {
  const groupInfo = GROUP_LINKS[productName];
  if (!groupInfo) {
    console.error(`Product not found: ${productName}`);
    return false;
  }

  const message = `
✅ <b>Bestellung genehmigt!</b>

<b>Bestellungs-ID:</b> <code>${orderId}</code>
<b>Produkt:</b> ${productName}

🎉 <b>Hier ist dein Zugang zur VIP Gruppe:</b>
<a href="${groupInfo.link}">Tritt der ${groupInfo.name} Gruppe bei</a>

Willkommen in unserer VIP Community! 🚀
  `;

  return sendTelegramMessage(userId, message);
}

// ==================== REJECTION MESSAGE WITH REASON ====================

export async function sendRejectionMessage(userId, orderId, productName, reason) {
  const message = `
❌ <b>Bestellung abgelehnt</b>

<b>Bestellungs-ID:</b> <code>${orderId}</code>
<b>Produkt:</b> ${productName}

<b>Grund:</b>
<i>${reason || 'Keine Details angegeben'}</i>

Bitte wende dich an den Support für weitere Informationen.
  `;

  return sendTelegramMessage(userId, message);
}

// ==================== COMPLETION MESSAGE (WHEN APPROVED) ====================

export async function sendCompletionMessage(userId, orderId, productName, code) {
  const groupInfo = GROUP_LINKS[productName];
  if (!groupInfo) {
    console.error(`Product not found: ${productName}`);
    return false;
  }

  const message = `
🎁 <b>Dein Code ist bereit!</b>

<b>Bestellungs-ID:</b> <code>${orderId}</code>
<b>Produkt:</b> ${productName}

<b>Dein Code:</b>
<code>${code}</code>

🔗 <b>Tritt jetzt der ${groupInfo.name} Gruppe bei:</b>
<a href="${groupInfo.link}">Zugang zur VIP Gruppe</a>

Vielen Dank für deinen Kauf! 🙌
  `;

  return sendTelegramMessage(userId, message);
}

// ==================== VALIDATE BOT TOKEN ====================

export async function validateBotToken() {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
    console.log(`✓ Telegram Bot connected: @${response.data.result.username}`);
    return true;
  } catch (error) {
    console.error('❌ Telegram Bot Token invalid or unreachable');
    return false;
  }
}
