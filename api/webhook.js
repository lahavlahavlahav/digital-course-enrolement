// api/webhook.js
// This handles Grow payment notifications

const crypto = require('crypto');

// Your Grow webhook key (keep this secret!)
const WEBHOOK_KEY = 'a6996443-27ab-53bb-4175-1e83425db858';

// Helper function to generate random username
function generateUsername() {
  return 'user_' + Math.random().toString(36).substring(2, 10);
}

// Helper function to generate random password
function generatePassword() {
  return Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
}

// Helper function to calculate expiration date (12 days from now)
function getExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 12);
  return date.toISOString();
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the payment data from Grow
    const paymentData = req.body;
    
    console.log('Received webhook from Grow:', paymentData);

    // Verify the webhook is from Grow (check if transaction was successful)
    if (paymentData.status !== 'success' && paymentData.statusCode !== '0') {
      console.log('Payment not successful:', paymentData.status);
      return res.status(200).json({ message: 'Payment not successful, no action taken' });
    }

    // Extract customer information
    const customerEmail = paymentData.email || paymentData.customerEmail;
    const customerName = paymentData.customerName || paymentData.name;
    const amount = paymentData.sum || paymentData.amount;
    const transactionId = paymentData.asmachta || paymentData.transactionId;

    // Validate we have essential data
    if (!customerEmail) {
      console.error('No customer email in webhook data');
      return res.status(400).json({ error: 'Missing customer email' });
    }

    // Generate user credentials
    const username = generateUsername();
    const password = generatePassword();
    const expirationDate = getExpirationDate();

    // TODO: Save to database
    // You'll need to add database connection here
    // For now, we'll just log it
    console.log('New user created:', {
      username,
      password,
      email: customerEmail,
      name: customerName,
      expirationDate,
      transactionId
    });

    // TODO: Send email to customer with login credentials
    // You'll need to integrate an email service here
    // Options: SendGrid, Resend, EmailJS, etc.
    
    // For now, return success
    return res.status(200).json({
      success: true,
      message: 'User created successfully',
      username: username,
      // Don't send password in response in production!
      // This is just for testing
      password: password
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
