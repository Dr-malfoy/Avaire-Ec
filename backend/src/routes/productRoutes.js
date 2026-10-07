const express = require('express');
const { getProducts, getProductById, getProductBySlug, createProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, adminOnly, createProduct);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

module.exports = router;
