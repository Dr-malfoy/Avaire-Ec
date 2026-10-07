const Coupon = require('../models/Coupon');
const { httpError } = require('../utils/httpError');

// POST /api/coupons/verify  { code }
const verifyCoupon = async (req, res, next) => {
  try {
    const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase() : '';
    if (!code) throw httpError(400, 'Coupon code is required');

    const coupon = await Coupon.findByPk(code);
    if (!coupon || !coupon.isActive) throw httpError(404, 'Invalid or inactive coupon');

    const { discountType, discountValue } = coupon;
    res.json({ code: coupon.code, discountType, discountValue });
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyCoupon };
