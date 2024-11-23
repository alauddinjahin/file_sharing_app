const express = require('express');

// Importing routers
const authRouter  = require('./auth');
const { sanitize } = require('../middleware/sanitizer');
const { validateRequest } = require('../middleware/validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
// Creating the main router
const router = express.Router();


// Defining public routes
router.get('/share-links', (req, res)=> {
 res.send("API: v1")
});

router.route('/register').post( 
    sanitize(), 
    validateRequest("register"), 
    authController.register
);

router.route('/login').post( 
    sanitize(), 
    validateRequest("login"), 
    authController.login
);

router.route('/logout').post( 
    sanitize(), 
    authController.logout
);


// Defining private routes
router.use('/auth', authMiddleware, authRouter);

// Exporting the router
module.exports = { router };
