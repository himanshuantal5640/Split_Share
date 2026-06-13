import { verifyToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyToken(token);
      
      // Attach user details to the request object
      // Note: Full database user validation should be added in subsequent phases.
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (err) {
      logger.warn('Failed token verification attempt:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
