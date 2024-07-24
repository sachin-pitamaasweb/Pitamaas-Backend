const express = require('express');
const { getClients, getUniqueRecords, getDuplicateRecords } = require('../controllers/clientController');

const router = express.Router();

// Define routes
router.get('/clients', getClients);
router.get('/unique-records', getUniqueRecords);
router.get('/duplicate-records', getDuplicateRecords);

module.exports = router;
