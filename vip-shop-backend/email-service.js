// ==================== SIMPLE EMAIL SERVICE ====================
// Temporarily disabled email sending - will be re-enabled with proper Resend config

export async function sendEmail(to, subject, html) {
  try {
    console.log(`📧 Email would be sent to ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   (Email service temporarily disabled)`);
    return true;
  } catch (error) {
    console.error(`Error logging email:`, error.message);
    return false;
  }
}

// ==================== INITIAL ORDER EMAIL ====================

export async function sendInitialOrderEmail(customerEmail, orderId, productName) {
  const subject = '📋 Deine Bestellung wurde erhalten - VIP Shop';
  console.log(`[Order Email] To: ${customerEmail}, Order: ${orderId}, Product: ${productName}`);
  return sendEmail(customerEmail, subject, '');
}

// ==================== APPROVAL EMAIL WITH GROUP LINK ====================

export async function sendApprovalEmail(customerEmail, orderId, productName) {
  const subject = '✅ Deine Bestellung wurde genehmigt! - VIP Shop';
  console.log(`[Approval Email] To: ${customerEmail}, Order: ${orderId}`);
  return sendEmail(customerEmail, subject, '');
}

// ==================== REJECTION EMAIL WITH REASON ====================

export async function sendRejectionEmail(customerEmail, orderId, productName, reason) {
  const subject = '❌ Update zu deiner Bestellung - VIP Shop';
  console.log(`[Rejection Email] To: ${customerEmail}, Order: ${orderId}, Reason: ${reason}`);
  return sendEmail(customerEmail, subject, '');
}

// ==================== COMPLETION EMAIL WITH CODE ====================

export async function sendCompletionEmail(customerEmail, orderId, productName, code) {
  const subject = '🎁 Dein Code ist bereit! - VIP Shop';
  console.log(`[Completion Email] To: ${customerEmail}, Order: ${orderId}, Code: ${code}`);
  return sendEmail(customerEmail, subject, '');
}
