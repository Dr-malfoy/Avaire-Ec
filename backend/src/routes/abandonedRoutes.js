const express = require('express');
const { upsertAbandonedCart } = require('../controllers/abandonedController');

const router = express.Router();

router.post('/', upsertAbandonedCart);

module.exports = router;
