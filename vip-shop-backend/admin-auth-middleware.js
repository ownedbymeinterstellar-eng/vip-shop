import jwt from 'jsonwebtoken';

// Admin Auth Middleware
export const adminAuthMiddleware = (secretKey) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, secretKey);
      req.adminId = decoded.adminId;
      req.adminLoginTime = decoded.iat;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', expiredAt: error.expiredAt });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

// Generate JWT Token
export const generateAdminToken = (secretKey, expiresIn = '8h') => {
  return jwt.sign(
    { adminId: 'admin', timestamp: Date.now() },
    secretKey,
    { expiresIn }
  );
};
