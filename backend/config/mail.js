module.exports = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.your-server.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // // Set true for SSL (465), false for TLS (587)
    auth: {
      user: process.env.SMTP_USER || 'your-email@your-domain.com',
      pass: process.env.SMTP_PASS || 'xxx',
    },
  },

  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Gmail uses TLS for port 587
    auth: {
      user: process.env.GMAIL_USER || 'your-email@gmail.com',
      pass: process.env.GMAIL_PASS || 'your-email-password',
    },
  },

  outlook: {
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // Outlook uses TLS for port 587
    auth: {
      user: process.env.OUTLOOK_USER || 'your-email@outlook.com',
      pass: process.env.OUTLOOK_PASS || 'your-email-password',
    },
  },

  webmail: {
    host: process.env.WEBMAIL_HOST || 'mail.your-domain.com',
    port: process.env.WEBMAIL_PORT || 587,
    secure: process.env.WEBMAIL_SECURE === 'true', // true for port 465, false for other ports
    auth: {
      user: process.env.WEBMAIL_USER || 'your-email@your-domain.com',
      pass: process.env.WEBMAIL_PASS || 'your-email-password',
    },
  },

  // Default sender details
  defaultSender: {
    name: process.env.DEFAULT_SENDER_NAME || 'Your App Name',
    email: process.env.DEFAULT_SENDER_EMAIL || 'no-reply@your-domain.com',
  },
};
