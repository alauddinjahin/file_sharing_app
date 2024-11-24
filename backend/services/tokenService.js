const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { salt } = require('../config').app;

class TokenService {
  constructor(secret) {
    this.secret = secret;
  }

  async generatePasswordResetToken(){
    try {
      // 2. Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedResetToken = await bcrypt.hash(resetToken, salt);
      const tokenExpiry = Date.now() + 3600000; // 1 hour from now

      return { resetToken, hashedResetToken, tokenExpiry }

    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Decode a JWT without verifying its signature.
   * @param {string} token - The JWT to decode.
   * @returns {object|null} - The decoded payload or null if invalid.
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (err) {
      console.error("Token decode error:", err.message);
      return null;
    }
  }

  /**
   * Check if a token is expired based on the `exp` field.
   * @param {string} token - The JWT to check.
   * @returns {boolean} - True if expired, false otherwise.
   */
  isTokenExpired(decoded) {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decoded.exp < currentTime;
  }

  /**
   * Validate a token by verifying its signature and checking expiration.
   * @param {string} token - The JWT to validate.
   * @returns {object} - Decoded payload if valid.
   * @throws {Error} - If the token is invalid or expired.
   */
  validateToken(token) {
    try {
      return jwt.verify(token, this.secret); // Verifies signature and expiration
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else {
        throw new Error("Invalid token");
      }
    }
  }
}

module.exports = new TokenService();
