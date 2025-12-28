// Email service temporarily disabled
// Will be re-enabled with Resend integration later

export async function sendEmail(to, subject, html) {
  console.log(`📧 [Email Disabled] Would send to: ${to}`);
  console.log(`   Subject: ${subject}`);
  return true;
}

export async function sendInitialOrderEmail(customerEmail, orderId, productName) {
  console.log(`📧 [Order Email] ${customerEmail} - Order: ${orderId}`);
  return true;
}

export async function sendApprovalEmail(customerEmail, orderId, productName) {
  console.log(`📧 [Approval Email] ${customerEmail} - Order: ${orderId}`);
  return true;
}

export async function sendRejectionEmail(customerEmail, orderId, productName, reason) {
  console.log(`📧 [Rejection Email] ${customerEmail} - Reason: ${reason}`);
  return true;
}

export async function sendCompletionEmail(customerEmail, orderId, productName, code) {
  console.log(`📧 [Completion Email] ${customerEmail} - Code: ${code}`);
  return true;
}
