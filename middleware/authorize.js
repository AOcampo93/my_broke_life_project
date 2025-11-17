// middleware/authorize.js
//
// Factory function that returns a middleware to restrict access based
// on user roles. Pass one or more allowed roles; if the authenticated
// user's role is not in the allowed list, a 403 Forbidden response is
// returned. Otherwise the next middleware is invoked. This middleware
// assumes that req.user has already been populated by the auth
// middleware.

module.exports = function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: true, message: 'User not authenticated' });
      }
      const { role } = req.user;
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: true, message: 'Forbidden: insufficient permissions' });
      }
      return next();
    } catch (err) {
      console.error('Authorization error:', err);
      return res.status(500).json({ error: true, message: 'Authorization failed' });
    }
  };
};