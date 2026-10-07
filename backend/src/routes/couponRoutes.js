const express = require('express');
const { verifyCoupon } = require('../controllers/couponController');

const router = express.Router();

router.post('/verify', verifyCoupon);

module.exports = router;
