// Minimal Stripe client using the REST API (no extra npm package needed).
const { httpError } = require('../utils/httpError');

const API = 'https://api.stripe.com/v1';
const currency = () => (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();

async function stripeRequest(method, path, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw httpError(503, 'Card payments are not configured. Please use Cash on Delivery.');

  const body = params ? new URLSearchParams(params).toString() : undefined;
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body,
    });
  } catch (e) {
    console.error('Stripe network error:', e.message);
    throw httpError(502, 'Could not reach the payment provider. Please try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Stripe error:', data?.error?.message || res.status);
    throw httpError(502, 'Payment provider error. Please try again.');
  }
  return data;
}

function createPaymentIntent(amountCents, metadata = {}) {
  if (amountCents < 50) throw httpError(400, 'Order total is too small for card payment');
  const params = {
    amount: String(amountCents),
    currency: currency(),
    'payment_method_types[]': 'card',
  };
  for (const [k, v] of Object.entries(metadata)) params[`metadata[${k}]`] = String(v).slice(0, 500);
  return stripeRequest('POST', '/payment_intents', params);
}

function retrievePaymentIntent(id) {
  if (typeof id !== 'string' || !/^pi_[A-Za-z0-9]+$/.test(id)) throw httpError(400, 'Invalid payment reference');
  return stripeRequest('GET', `/payment_intents/${id}`);
}

module.exports = { createPaymentIntent, retrievePaymentIntent, currency };
