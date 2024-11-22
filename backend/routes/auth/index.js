const express = require('express');
const { sanitize } = require('../../middleware/sanitizer');
const authController = require('../../controllers/authController');
const { validateRequest } = require('../../middleware/validator');
const router = express.Router();

router.route('/register').post( sanitize(), validateRequest("register|async"), authController.register);
router.route('/login').post( sanitize(), validateRequest("login"), authController.login);

module.exports = router