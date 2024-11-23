const express = require('express');
const { sanitize } = require('../../middleware/sanitizer');
const { validateRequest } = require('../../middleware/validator');
const router = express.Router();

// router.route('/register').post( sanitize(), validateRequest("register|async"), authController.register);

module.exports = router