const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('[Auth Error] JWT_SECRET is not configured in backend/.env');
        return res.status(500).json({ success: false, message: 'Server configuration error: authentication secret is missing' });
      }
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no management token provided' });
  }
};

module.exports = { protect };
