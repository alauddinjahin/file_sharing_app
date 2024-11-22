const express = require('express');

// Importing routers
const authRouter  = require('./auth');
// Creating the main router
const router = express.Router();


// Defining routes
router.get('/share-links', (req, res)=> {
 res.send("API: v1")
});

router.use('/auth', authRouter);

// Exporting the router
module.exports = { router };
