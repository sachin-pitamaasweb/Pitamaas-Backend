const express = require('express');
const router = express.Router();

const { getSocialClientInfo, getClientInfo } = require('../controllers/newClientController.js');

// Define routes
router.get('/social-client-info', getSocialClientInfo);
router.get('/client-info', getClientInfo);


module.exports = router
