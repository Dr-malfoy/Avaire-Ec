const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');
const AbandonedCart = require('../models/AbandonedCart');
const Section = require('../models/Section');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { httpError } = require('../utils/httpError');

const ORDER_STATUSES = ['pending', 'paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const ABANDONED_STATUSES = ['abandoned', 'contacted', 'recovered'];
const LOW_STOCK_LIMIT = 5;

// Fields an admin may set on a product (id/timestamps are never taken from the body)
const PRODUCT_FIELDS = ['name', 'slug', 'price', 'originalPrice', 'category', 'section', 'badge', 'description',
  'sizes', 'colors', 'image', 'images', 'icon', 'inStock', 'stockCount'];

const pick = (obj, keys) => {
  const out = {};
  for (const k of keys) if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  return out;
};

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const normalizeProduct = (data) => {
  const d = { ...data };
  if (d.slug !== undefined) d.slug = slugify(d.slug);
  if (d.originalPrice === '' || d.originalPrice === 0 || d.originalPrice === '0') d.originalPrice = null;
  if (d.badge === '') d.badge = null;
  if (d.section === '') d.section = null;
  if (d.stockCount !== undefined) d.stockCount = Math.max(0, Number.parseInt(d.stockCount, 10) || 0);
  if (Array.isArray(d.images) && d.images.length && !d.image) d.image = d.images[0];
  return d;
};

// ─── Auth ──────────────────────────────────────────────────────────────────

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      throw httpError(400, 'Email and password are required');
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase(), role: 'admin' } })
      || await User.findOne({ where: { email: email.trim(), role: 'admin' } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw httpError(401, 'Invalid email or password');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

const adminLogout = async (req, res) => {
  res.json({ success: true });
};

const getAdminMe = async (req, res) => {
  const { id, name, email, role } = req.user;
  res.json({ id, name, email, role });
};

// ─── Dashboard ─────────────────────────────────────────────────────────────

const getDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const [orders, totalProducts, lowStock, outOfStock, unreadChats, abandonedCount] = await Promise.all([
      Order.findAll({ order: [['createdAt', 'DESC']] }),
      Product.count(),
      Product.findAll({
        where: { stockCount: { [Op.lt]: LOW_STOCK_LIMIT } },
        order: [['stockCount', 'ASC']],
        limit: 6,
      }),
      Product.count({ where: { [Op.or]: [{ inStock: false }, { stockCount: { [Op.lte]: 0 } }] } }),
      ChatConversation.count({ where: { unreadByAdmin: { [Op.gt]: 0 } } }),
      AbandonedCart.count({ where: { status: 'abandoned' } }),
    ]);

    const active = orders.filter((o) => o.status !== 'Cancelled');
    const sum = (list) => Math.round(list.reduce((acc, o) => acc + (Number(o.total) || 0), 0) * 100) / 100;

    const customerKey = (o) => (o.customer?.phone || o.customer?.email || '').toLowerCase();
    const allCustomers = new Set(orders.map(customerKey).filter(Boolean));
    const firstOrderAt = new Map();
    for (const o of [...orders].reverse()) {
      const k = customerKey(o);
      if (k && !firstOrderAt.has(k)) firstOrderAt.set(k, new Date(o.createdAt));
    }
    const newCustomers = [...firstOrderAt.values()].filter((d) => d >= startOfMonth).length;

    const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;

    // Revenue for each of the last 7 days (oldest first)
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(startOfToday);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayOrders = active.filter((o) => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) < dayEnd);
      const ymd = `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, '0')}-${String(dayStart.getDate()).padStart(2, '0')}`;
      last7.push({ date: ymd, revenue: sum(dayOrders), orders: dayOrders.length });
    }

    const todaysOrders = active.filter((o) => new Date(o.createdAt) >= startOfToday);
    const monthOrders = active.filter((o) => new Date(o.createdAt) >= startOfMonth);

    res.json({
      totalRevenue: sum(active),
      monthRevenue: sum(monthOrders),
      todayRevenue: sum(todaysOrders),
      totalOrders: orders.length,
      todayOrders: todaysOrders.length,
      pendingOrders: statusCounts.pending || 0,
      totalProducts,
      outOfStock,
      totalCustomers: allCustomers.size,
      newCustomers,
      unreadChats,
      abandonedCount,
      statusCounts,
      last7,
      recentOrders: orders.slice(0, 6),
      lowStock,
    });
  } catch (error) {
    next(error);
  }
};

// Small counters for the sidebar badges
const getAdminBadges = async (req, res, next) => {
  try {
    const [pendingOrders, unreadChats, abandoned] = await Promise.all([
      Order.count({ where: { status: 'pending' } }),
      ChatConversation.count({ where: { unreadByAdmin: { [Op.gt]: 0 } } }),
      AbandonedCart.count({ where: { status: 'abandoned' } }),
    ]);
    res.json({ pendingOrders, unreadChats, abandoned });
  } catch (error) {
    next(error);
  }
};

// ─── Products ──────────────────────────────────────────────────────────────

const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getAdminProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw httpError(404, 'Product not found');
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createAdminProduct = async (req, res, next) => {
  try {
    const data = normalizeProduct(pick(req.body, PRODUCT_FIELDS));
    if (!data.name || !String(data.name).trim()) throw httpError(400, 'Product name is required');
    if (data.price === undefined || data.price === '' || Number(data.price) < 0 || Number.isNaN(Number(data.price))) {
      throw httpError(400, 'A valid price is required');
    }
    if (!data.category) data.category = 'Clothing';
    if (!data.slug) data.slug = `${slugify(data.name)}-${Date.now().toString(36)}`;
    if (await Product.findOne({ where: { slug: data.slug } })) data.slug = `${data.slug}-${Date.now().toString(36)}`;

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const updateAdminProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw httpError(404, 'Product not found');

    const data = normalizeProduct(pick(req.body, PRODUCT_FIELDS));
    if (data.slug === '') delete data.slug;
    if (data.slug && data.slug !== product.slug) {
      const clash = await Product.findOne({ where: { slug: data.slug, id: { [Op.ne]: product.id } } });
      if (clash) throw httpError(400, 'Another product already uses this URL slug');
    }
    await product.update(data);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteAdminProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw httpError(404, 'Product not found');
    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Orders ────────────────────────────────────────────────────────────────

const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateAdminOrder = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!ORDER_STATUSES.includes(status)) {
      throw httpError(400, `Status must be one of: ${ORDER_STATUSES.join(', ')}`);
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) throw httpError(404, 'Order not found');
    await order.update({ status });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// ─── Live chat ─────────────────────────────────────────────────────────────

const findConversation = async (id) =>
  (await ChatConversation.findByPk(id)) || ChatConversation.findOne({ where: { sessionId: id } });

const getAdminChat = async (req, res, next) => {
  try {
    const conversations = await ChatConversation.findAll({
      order: [['lastMessageAt', 'DESC'], ['updatedAt', 'DESC']],
    });
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

const getAdminChatById = async (req, res, next) => {
  try {
    const conversation = await findConversation(req.params.id);
    if (!conversation) throw httpError(404, 'Conversation not found');

    if (conversation.unreadByAdmin > 0) {
      conversation.unreadByAdmin = 0;
      await conversation.save();
    }

    const messages = await ChatMessage.findAll({
      where: { conversationId: conversation.id },
      order: [['createdAt', 'ASC']],
    });
    res.json({ conversation, messages });
  } catch (error) {
    next(error);
  }
};

const replyAdminChat = async (req, res, next) => {
  try {
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content) throw httpError(400, 'Message content is required');
    if (content.length > 2000) throw httpError(400, 'Message is too long');

    const conversation = await findConversation(req.params.id);
    if (!conversation) throw httpError(404, 'Conversation not found');

    const message = await ChatMessage.create({ conversationId: conversation.id, content, sender: 'admin' });

    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    conversation.unreadByCustomer = (conversation.unreadByCustomer || 0) + 1;
    if (conversation.status === 'closed') conversation.status = 'open';
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

const updateAdminChatStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['open', 'closed'].includes(status)) throw httpError(400, 'Status must be open or closed');

    const conversation = await findConversation(req.params.id);
    if (!conversation) throw httpError(404, 'Conversation not found');

    conversation.status = status;
    await conversation.save();
    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

// ─── Abandoned carts ───────────────────────────────────────────────────────

// Shape expected by app/admin/abandoned/page.tsx
const toAbandonedDTO = (c) => ({
  _id: c.id,
  id: c.id,
  customer: {
    name: c.name || undefined,
    email: c.email,
    phone: c.phone || undefined,
    address: c.address || undefined,
    city: c.city || undefined,
    country: c.country || undefined,
  },
  items: Array.isArray(c.items) ? c.items : [],
  total: Number(c.total) || 0,
  source: c.source === 'buy-now' ? 'buy-now' : 'checkout',
  status: ABANDONED_STATUSES.includes(c.status) ? c.status : 'abandoned',
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

const getAdminAbandoned = async (req, res, next) => {
  try {
    const carts = await AbandonedCart.findAll({ order: [['updatedAt', 'DESC']] });
    res.json(carts.map(toAbandonedDTO));
  } catch (error) {
    next(error);
  }
};

const updateAdminAbandoned = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!ABANDONED_STATUSES.includes(status)) throw httpError(400, 'Invalid status');
    const cart = await AbandonedCart.findByPk(req.params.id);
    if (!cart) throw httpError(404, 'Record not found');
    await cart.update({ status });
    res.json(toAbandonedDTO(cart));
  } catch (error) {
    next(error);
  }
};

const deleteAdminAbandoned = async (req, res, next) => {
  try {
    const cart = await AbandonedCart.findByPk(req.params.id);
    if (!cart) throw httpError(404, 'Record not found');
    await cart.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── Uploads ───────────────────────────────────────────────────────────────

const adminUpload = async (req, res, next) => {
  try {
    if (!req.file) throw httpError(400, 'No file uploaded');
    res.json({ url: `/api/uploads/${req.file.filename}` });
  } catch (error) {
    next(error);
  }
};

// ─── Sections ──────────────────────────────────────────────────────────────

const SECTION_FIELDS = ['label', 'desc', 'emoji'];

const getAdminSections = async (req, res, next) => {
  try {
    const sections = await Section.findAll({ order: [['createdAt', 'ASC']] });
    res.json(sections);
  } catch (error) {
    next(error);
  }
};

const createAdminSection = async (req, res, next) => {
  try {
    const id = String(req.body?.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const data = pick(req.body, SECTION_FIELDS);
    if (!id || !data.label) throw httpError(400, 'ID and Label are required');
    if (await Section.findByPk(id)) throw httpError(400, `A section with ID "${id}" already exists`);
    const section = await Section.create({ id, ...data });
    res.status(201).json(section);
  } catch (error) {
    next(error);
  }
};

const updateAdminSection = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) throw httpError(404, 'Section not found');
    await section.update(pick(req.body, SECTION_FIELDS)); // the ID itself cannot be renamed
    res.json(section);
  } catch (error) {
    next(error);
  }
};

const deleteAdminSection = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) throw httpError(404, 'Section not found');
    await Product.update({ section: null }, { where: { section: section.id } });
    await section.destroy();
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Coupons ───────────────────────────────────────────────────────────────

const COUPON_TYPES = ['percent', 'fixed', 'shipping'];

const cleanCoupon = (body, { partial = false } = {}) => {
  const data = pick(body, ['discountType', 'discountValue', 'isActive']);
  if (!partial || data.discountType !== undefined) {
    if (!COUPON_TYPES.includes(data.discountType)) throw httpError(400, 'Invalid discount type');
  }
  if (data.discountType === 'shipping') data.discountValue = 0;
  if (data.discountValue !== undefined) {
    const v = Number(data.discountValue);
    if (Number.isNaN(v) || v < 0) throw httpError(400, 'Discount value must be 0 or more');
    if (data.discountType === 'percent' && v > 100) throw httpError(400, 'Percentage cannot be more than 100');
    data.discountValue = v;
  } else if (!partial) {
    data.discountValue = 0;
  }
  if (data.isActive !== undefined) data.isActive = Boolean(data.isActive);
  return data;
};

const getAdminCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

const createAdminCoupon = async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) throw httpError(400, 'Code must be 2–40 letters/numbers');
    if (await Coupon.findByPk(code)) throw httpError(400, `Coupon "${code}" already exists`);
    const coupon = await Coupon.create({ code, ...cleanCoupon(req.body) });
    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

const updateAdminCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.code);
    if (!coupon) throw httpError(404, 'Coupon not found');
    await coupon.update(cleanCoupon(req.body, { partial: true })); // code itself is the key and is not changed
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

const deleteAdminCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.code);
    if (!coupon) throw httpError(404, 'Coupon not found');
    await coupon.destroy();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getAdminMe,
  getDashboardStats,
  getAdminBadges,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrder,
  getAdminChat,
  getAdminChatById,
  replyAdminChat,
  updateAdminChatStatus,
  getAdminAbandoned,
  updateAdminAbandoned,
  deleteAdminAbandoned,
  adminUpload,
  getAdminSections,
  createAdminSection,
  updateAdminSection,
  deleteAdminSection,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
};
