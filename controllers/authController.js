const jwt = require('jsonwebtoken');

// @desc    Verify portfolio management password
// @route   POST /api/auth/verify
// @access  Public
const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter the management password' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword || !jwtSecret) {
      console.error('[Auth Error] ADMIN_PASSWORD or JWT_SECRET is not configured in backend/.env');
      return res.status(500).json({ success: false, message: 'Server configuration error: authentication secret is missing' });
    }

    if (password !== adminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid portfolio management password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: 'portfolio-admin' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Password verified successfully',
      token
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying password' });
  }
};

module.exports = {
  verifyPassword
};
