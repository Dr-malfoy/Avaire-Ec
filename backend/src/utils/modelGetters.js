// MySQL returns DECIMAL columns as strings, and MariaDB returns JSON columns as
// strings. These getters make every API response use real numbers/arrays.
const decimalGetter = (field) => function () {
  const v = this.getDataValue(field);
  return v === null || v === undefined ? v : Number(v);
};

const jsonGetter = (field, fallback) => function () {
  const v = this.getDataValue(field);
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return fallback; }
  }
  return v === null || v === undefined ? fallback : v;
};

module.exports = { decimalGetter, jsonGetter };
