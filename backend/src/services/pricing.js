// Server-side price calculation. The browser's prices/totals are never trusted.
// Rules mirror the storefront: free shipping from 150, otherwise 12 flat.
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { httpError } = require('../utils/httpError');

// Delivery fees: Inside Dhaka = 80 BDT, Outside Dhaka = 150 BDT
const SHIPPING_INSIDE_DHAKA_CENTS = 80 * 100;
const SHIPPING_OUTSIDE_DHAKA_CENTS = 150 * 100;
const MAX_LINES = 50;
const MAX_QTY = 100;

const toCents = (n) => Math.round(Number(n) * 100);
const cleanStr = (v, max = 100) => (v === undefined || v === null ? undefined : String(v).slice(0, max));

/**
 * @param {Array<{id:string, qty:number, size?:string, color?:string}>} rawItems
 * @param {string|null} couponCode
 * @param {{shippingZone?:string, transaction?:any, lock?:any}} opts
 */
async function priceOrder(rawItems, couponCode, { shippingZone = 'inside_dhaka', transaction, lock } = {}) {
  let items = rawItems;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { items = null; }
  }
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'Your cart is empty');
  if (items.length > MAX_LINES) throw httpError(400, 'Too many items in cart');

  const ids = [...new Set(items.map((i) => String(i?.id ?? i?.productId ?? '')).filter(Boolean))];
  const products = ids.length ? await Product.findAll({ where: { id: ids }, transaction, lock }) : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  const qtyById = new Map();
  let subtotalCents = 0;

  for (const raw of items) {
    const id = String(raw?.id ?? raw?.productId ?? '');
    const product = byId.get(id);
    if (!product) throw httpError(400, `"${cleanStr(raw?.name) || 'An item'}" is no longer available. Please remove it from your cart.`);

    const qty = Number.parseInt(raw.qty, 10);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw httpError(400, `Invalid quantity for "${product.name}"`);

    qtyById.set(id, (qtyById.get(id) || 0) + qty);
    const priceCents = toCents(product.price);
    subtotalCents += priceCents * qty;

    const images = product.images;
    lines.push({
      id: product.id,
      name: product.name,
      price: priceCents / 100,
      qty,
      size: cleanStr(raw.size, 50),
      color: cleanStr(raw.color, 50),
      image: (Array.isArray(images) && images[0]) || product.image || product.icon || undefined,
      category: product.category,
    });
  }

  for (const [id, qty] of qtyById) {
    const p = byId.get(id);
    const stock = Number(p.stockCount ?? 0);
    if (p.inStock === false || stock < qty) {
      throw httpError(409, stock > 0 && p.inStock !== false
        ? `Only ${stock} of "${p.name}" left in stock`
        : `"${p.name}" is out of stock`);
    }
  }

  const isOutsideDhaka = String(shippingZone).toLowerCase().includes('outside') || Number(shippingZone) === 150;
  let shippingCents = isOutsideDhaka ? SHIPPING_OUTSIDE_DHAKA_CENTS : SHIPPING_INSIDE_DHAKA_CENTS;
  let discountCents = 0;
  let coupon = null;

  if (couponCode !== undefined && couponCode !== null && couponCode !== '') {
    if (typeof couponCode !== 'string') throw httpError(400, 'Invalid coupon code');
    coupon = await Coupon.findByPk(couponCode.trim().toUpperCase(), { transaction });
    if (!coupon || !coupon.isActive) throw httpError(400, 'Invalid or inactive coupon');

    const value = Number(coupon.discountValue) || 0;
    if (coupon.discountType === 'percent') {
      discountCents = Math.round((subtotalCents * Math.min(Math.max(value, 0), 100)) / 100);
    } else if (coupon.discountType === 'fixed') {
      discountCents = Math.min(toCents(Math.max(value, 0)), subtotalCents);
    } else if (coupon.discountType === 'shipping') {
      shippingCents = 0;
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);

  return {
    items: lines,
    qtyById,
    productsById: byId,
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    shipping: shippingCents / 100,
    shippingZone: isOutsideDhaka ? 'outside_dhaka' : 'inside_dhaka',
    total: totalCents / 100,
    totalCents,
    couponCode: coupon ? coupon.code : null,
  };
}

module.exports = { priceOrder };
