const express = require('express');
const { getOrders, getOrderById, trackOrder, createOrder } = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/', createOrder);                    // public checkout
router.get('/track', trackOrder);                 // public tracking (?orderNumber=&email=)
router.get('/track/:orderNumber', trackOrder);    // older URL, still needs ?email=
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
