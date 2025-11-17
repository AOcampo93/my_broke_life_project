// middleware/error.js
//
// A centralized error handler. Any errors passed to next(err) will
// be captured here and a JSON response will be sent to the client.
// In production you might want to hide stack traces and return a
// generic message; here we include the error stack when not in
// production to aid debugging.

module.exports = (err, req, res, next) => {
  console.error('Error handler caught an error:', err);
  const status = err.status || 500;
  const response = {
    error: true,
    message: err.message || 'Internal Server Error',
  };
  // Only include stack trace when in development mode
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  res.status(status).json(response);
};