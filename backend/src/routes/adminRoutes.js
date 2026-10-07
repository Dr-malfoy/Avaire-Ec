const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { protect, adminOnly } = require('../middlewares/auth');
const admin = require('../controllers/adminController');
const { updateSettings } = require('../controllers/settingController');

// Public
router.post('/login', admin.adminLogin);
router.post('/logout', admin.adminLogout);

// Everything below requires a logged-in ADMIN account
router.use(protect, adminOnly);

router.get('/me', admin.getAdminMe);
router.get('/dashboard', admin.getDashboardStats);
router.get('/badges', admin.getAdminBadges);

router.get('/products', admin.getAdminProducts);
router.get('/products/:id', admin.getAdminProductById);
router.post('/products', admin.createAdminProduct);
router.put('/products/:id', admin.updateAdminProduct);
router.delete('/products/:id', admin.deleteAdminProduct);

router.get('/orders', admin.getAdminOrders);
router.patch('/orders/:id', admin.updateAdminOrder);

router.get('/chat', admin.getAdminChat);
router.get('/chat/:id', admin.getAdminChatById);
router.post('/chat/:id', admin.replyAdminChat);
router.patch('/chat/:id', admin.updateAdminChatStatus);

router.get('/abandoned', admin.getAdminAbandoned);
router.patch('/abandoned/:id', admin.updateAdminAbandoned);
router.delete('/abandoned/:id', admin.deleteAdminAbandoned);

router.get('/sections', admin.getAdminSections);
router.post('/sections', admin.createAdminSection);
router.put('/sections/:id', admin.updateAdminSection);
router.delete('/sections/:id', admin.deleteAdminSection);

router.get('/coupons', admin.getAdminCoupons);
router.post('/coupons', admin.createAdminCoupon);
router.put('/coupons/:code', admin.updateAdminCoupon);
router.delete('/coupons/:code', admin.deleteAdminCoupon);

router.put('/settings', updateSettings);

router.post('/upload', upload.single('file'), admin.adminUpload);

module.exports = router;
