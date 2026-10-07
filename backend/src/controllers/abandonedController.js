const AbandonedCart = require('../models/AbandonedCart');
const { httpError } = require('../utils/httpError');

const str = (v, max = 200) => (v === undefined || v === null || v === '' ? null : String(v).trim().slice(0, max));

// Public: called (debounced) from checkout / buy-now while the customer types.
const upsertAbandonedCart = async (req, res, next) => {
  try {
    const body = req.body || {};
    // Accept both { customer: {...} } (what the storefront sends) and flat fields
    const c = body.customer && typeof body.customer === 'object' ? body.customer : body;

    const email = String(c.email ?? body.email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, 'A valid email is required');

    const items = Array.isArray(body.items)
      ? body.items.slice(0, 50).map((i) => ({
          id: str(i?.id, 64),
          name: str(i?.name) || 'Item',
          price: Number(i?.price) || 0,
          qty: Math.max(1, Number.parseInt(i?.qty, 10) || 1),
          size: str(i?.size, 50),
          color: str(i?.color, 50),
          image: str(i?.image, 500),
          category: str(i?.category, 100),
        }))
      : [];
    if (items.length === 0) throw httpError(400, 'Cart is empty');

    const data = {
      email,
      name: str(c.name),
      phone: str(c.phone, 30),
      address: str(c.address),
      city: str(c.city, 100),
      country: str(c.country, 100),
      zip: str(c.zip, 20),
      items,
      total: Math.max(0, Number(body.total) || 0),
      source: body.source === 'buy-now' ? 'buy-now' : 'checkout',
    };

    const existing = await AbandonedCart.findOne({ where: { email } });
    if (existing) {
      // A new cart after a recovered one starts a fresh follow-up
      await existing.update({ ...data, status: existing.status === 'recovered' ? 'abandoned' : existing.status });
    } else {
      await AbandonedCart.create(data);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { upsertAbandonedCart };
