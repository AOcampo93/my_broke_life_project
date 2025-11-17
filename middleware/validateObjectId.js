// middleware/validateObjectId.js
//
// Validate that a path parameter named :id is a valid MongoDB ObjectId.
// If the id is invalid, return a 400 Bad Request. Otherwise, forward
// the request to the next handler. Using this middleware early in
// routes helps avoid unnecessary database queries with invalid ids.

const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: true, message: 'Invalid ID format' });
  }
  return next();
};