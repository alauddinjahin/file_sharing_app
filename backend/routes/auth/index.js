const express = require('express');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const { sanitize } = require('../../middleware/sanitizer');
const fileRouter = require('./file');
const router = express.Router();

router.route('/users').get(userController.getUsers);

router.route('/refresh-token').post(authController.refreshToken);

router.route('/logout').post( 
    sanitize(), 
    authController.logout
);

router.use('/', fileRouter);

module.exports = router