const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  if (err.name === 'MulterError') status = 400;
  if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON body'; }
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    status = 400;
    message = err.errors?.[0]?.message || message;
  }

  if (status >= 500) console.error(err);

  const isDev = process.env.NODE_ENV === 'development';
  res.status(status).json({
    success: false,
    message: status >= 500 && !isDev ? 'Internal Server Error' : message,
    data: isDev ? err.stack : null,
  });
};

module.exports = { errorHandler };
