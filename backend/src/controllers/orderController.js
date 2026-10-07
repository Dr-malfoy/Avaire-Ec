const crypto = require('crypto');
const { z } = require('zod');
const { sequelize } = require('../config/db');
const Order = require('../models/Order');
const AbandonedCart = require('../models/AbandonedCart');
const { priceOrder } = require('../services/pricing');
const { httpError } = require('../utils/httpError');

// What the checkout form collects: name, phone, email, address (Cash on Delivery only)
const customerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(100),
  phone: z.string().trim()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .refine((v) => /^(\+?88)?01[3-9]\d{8}$/.test(v), 'Please enter a valid Bangladeshi phone number'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  address: z.string().trim().min(3, 'Please enter your delivery address').max(300),
  city: z.string().trim().max(100).optional(),
  deliveryZone: z.string().trim().max(50).optional(),
  deliveryCharge: z.number().optional(),
});

const newOrderNumber = () =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

const isAdmin = (req) => req.user && req.user.role === 'admin';
const ownsOrder = (req, order) =>
  !!req.user && (order.customer?.email || '').toLowerCase() === String(req.user.email).toLowerCase();

// GET /api/orders  (logged in) — admins see everything, customers only their own
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(isAdmin(req) ? orders : orders.filter((o) => ownsOrder(req, o)));
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id  (logged in)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order || (!isAdmin(req) && !ownsOrder(req, order))) throw httpError(404, 'Order not found');
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/track?orderNumber=...&email=...   (public)
// GET /api/orders/track/:orderNumber?email=...       (public, older URL)
// The email must match, so order details can't be looked up by number alone.
const trackOrder = async (req, res, next) => {
  try {
    const orderNumber = String(req.params.orderNumber || req.query.orderNumber || '').trim();
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!orderNumber || !email) throw httpError(400, 'Order number and email are required');

    const order = await Order.findOne({ where: { orderNumber } });
    if (!order || (order.customer?.email || '').toLowerCase() !== email) {
      throw httpError(404, 'Could not find your order. Please check the details and try again.');
    }

    const c = order.customer || {};
    res.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        items: order.items,
        customer: {
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          city: c.city,
          deliveryZone: c.deliveryZone,
          deliveryCharge: c.deliveryCharge,
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders  (public checkout, Cash on Delivery)
// Prices, discounts, shipping and stock all come from the database — never from the browser.
const createOrder = async (req, res, next) => {
  try {
    const body = req.body || {};
    const customer = customerSchema.parse(body.customer || {});
    const shippingZone = body.shippingZone || customer.deliveryZone || 'inside_dhaka';

    const order = await sequelize.transaction(async (transaction) => {
      const priced = await priceOrder(body.items, body.couponCode, {
        shippingZone,
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      // Reduce stock
      for (const [id, qty] of priced.qtyById) {
        const product = priced.productsById.get(id);
        const left = Number(product.stockCount) - qty;
        await product.update({ stockCount: left, inStock: left > 0 }, { transaction });
      }

      const enrichedCustomer = {
        ...customer,
        deliveryZone: priced.shippingZone === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka',
        deliveryCharge: priced.shipping,
      };

      return Order.create({
        orderNumber: newOrderNumber(),
        customer: enrichedCustomer,
        items: priced.items,
        total: priced.total,
        status: 'pending',
        paymentMethod: 'Cash on Delivery',
      }, { transaction });
    });

    // The customer finished checking out — close their abandoned-cart follow-up
    AbandonedCart.update({ status: 'recovered' }, { where: { email: customer.email } }).catch(() => {});

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(httpError(400, error.issues?.[0]?.message || 'Please check your details'));
    }
    next(error);
  }
};

module.exports = { getOrders, getOrderById, trackOrder, createOrder };
