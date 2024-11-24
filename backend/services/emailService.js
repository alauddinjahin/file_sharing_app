const nodemailer = require('nodemailer');
const emailConfig = require('../config');
const fs = require('fs');
const path = require('path');

class EmailService {
  _mailConfig  = null;
  constructor(provider = 'smtp') {
    this.provider = provider;
    this.transporter = this.#createTransporter(provider);
  }

  /**
   * Create a nodemailer transporter for the specified provider.
   * @param {string} provider - Email provider ('smtp', 'gmail', 'outlook', 'webmail').
   * @returns {Object} - Nodemailer transporter.
   */
  #createTransporter(provider) {
    this._mailConfig = emailConfig?.mail;
    const currentProvider = this._mailConfig[provider];
    console.log('Mail config--->', {[provider]: currentProvider})
    if (!currentProvider) {
      throw new Error(`Email provider "${provider}" is not configured.`);
    }

    return nodemailer.createTransport(currentProvider);
  }

  /**
   * Send a single email.
   * @param {Object} options - Email options.
   * @param {string} options.to - Recipient email address.
   * @param {string} options.subject - Subject of the email.
   * @param {string} options.text - Plain text body.
   * @param {string} [options.html] - HTML body.
   * @param {string} [options.from] - Sender email address.
   * @returns {Promise<Object>} - Email sending result.
   */


  async sendEmail({ to, subject, text, html, from, cc, bcc }) {
    try {
      // Log the default sender for debugging
      console.log('Mail config sender--->', this._mailConfig?.defaultSender);
  
      // Use the from address if provided, otherwise fallback to default sender
      const sender = from || `${this._mailConfig?.defaultSender?.name} <${this._mailConfig?.defaultSender?.email}>`;
  
      // Prepare the email options
      const mailOptions = {
        from: sender,
        to,
        subject,
        text,
        html,
        ...(cc && { cc }),          // Include cc if provided
        ...(bcc && { bcc }),        // Include bcc if provided
        // ...(attachments && { attachments }), // Include attachments if provided
      };
  
      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
  
      console.log(`Email sent to ${to}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error.message);
      throw new Error('Failed to send email.');
    }
  }
  


  async sendEmailWithAttachment({ to, subject, text, html, from, cc, bcc, attachments }) {
    try {
      // Log the mail configuration for debugging
      console.log('Mail config sender--->', this._mailConfig?.defaultSender);
  
      // Determine the sender email and name
      const sender = from || `${this._mailConfig?.defaultSender?.name} <${this._mailConfig?.defaultSender?.email}>`;
  
      // Ensure the 'attachments' field is an array (it could be a single file or an array)
      const attachmentArray = Array.isArray(attachments) ? attachments : [attachments];
  
      // Sending the email with raw file attachments
      const info = await this.transporter.sendMail({
        from: sender,
        to,
        subject,
        text,
        html,
        ...(cc && { cc }),          // Include cc if provided
        ...(bcc && { bcc }),        // Include bcc if provided
        attachments: attachmentArray, // Attachments array (including raw files)
      });
  
      console.log(`Email with attachment sent to ${to}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Error sending email with attachment to ${to}:`, error.message);
      throw new Error('Failed to send email with attachment.');
    }
  }


/**
 * Sends an email with various types of file inputs (path, object, input, base64, content).
 * @param {Object} options - Email options with file information.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Subject of the email.
 * @param {string} options.text - Plain text body.
 * @param {string} [options.html] - HTML body.
 * @param {string} [options.from] - Sender's email address.
 * @param {any} options.file - The file or file-related data (path, Buffer, Stream, base64, content).
 * @returns {Promise<Object>} - Result of the email sending.
 */
async sendEmailWithDynamicAttachment({ to, subject, text, html, from, file }) {
  try {

    let attachment;

    // Handle file path input
    if (typeof file === 'string' && fs.existsSync(file)) {
      // File path
      attachment = {
        filename: path.basename(file),
        path: file,
      };
    }
    // Handle Buffer or Stream input (File as Object)
    else if (Buffer.isBuffer(file) || file instanceof fs.ReadStream) {
      attachment = {
        filename: 'file', // Default name for Buffer or Stream files
        content: file,
      };
    }
    // Handle Base64 encoded file
    else if (typeof file === 'string' && file.startsWith('data:')) {
      const base64Data = file.split(',')[1]; // Extract base64 data
      const buffer = Buffer.from(base64Data, 'base64');
      attachment = {
        filename: 'file', // Default name for base64 file
        content: buffer,
      };
    }
    // Handle Raw File Content (Buffer or Stream)
    else if (Buffer.isBuffer(file) || file instanceof fs.ReadStream) {
      attachment = {
        filename: 'file', // Default name for raw file content
        content: file,
      };
    }
    // If none of the above types are matched, throw error
    else {
      throw new Error('Unsupported file type');
    }

    // Send email with attachment
    const info = await transporter.sendMail({
      from: from || 'default-sender@example.com', // Default sender if not provided
      to,
      subject,
      text,
      html,
      attachments: [attachment], // Array of attachments (can be expanded for multiple files)
    });

    console.log(`Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email with attachment to ${to}:`, error.message);
    throw new Error('Failed to send email with attachment.');
  }
}

  

  /**
   * Send bulk emails in parallel.
   * @param {Array} recipients - List of recipient email addresses.
   * @param {string} subject - Email subject.
   * @param {string} text - Plain text body.
   * @param {string} [html] - HTML body.
   * @param {string} [from] - Sender email address.
   * @returns {Promise<Array>} - Results of email sending.
   */
  async sendBulkEmails(recipients, subject, text, html, from, cc, bcc, attachments=[]) {
    const payloadToMail = { to, subject, text, html, from, cc, bcc, ...(attachments?.length && { attachments }) };
    const methodToMail = attachments?.length ? "sendEmailWithAttachment" : "sendEmail";
    const promises = recipients.map((to) =>
      this[methodToMail](payloadToMail).catch((error) => ({
        recipient: to,
        success: false,
        error: error?.message || "Something wents wrong.",
      }))
    );

    const results = await Promise.all(promises);
    results.forEach((result) => {
      if (!result.success) {
        console.error(`Failed to send email to ${result.recipient}: ${result.error}`);
      }
    });

    return results;
  }
}

module.exports = EmailService;
