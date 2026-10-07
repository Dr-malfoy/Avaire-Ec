// Create an Error that carries an HTTP status for the central error handler.
const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { httpError };
