import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Middleware to protect routes by verifying JWT and confirming user exists in DB.
 */
export const requireAuth = async (req, res, next) => {
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
      
      // Query the database to ensure the user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.'
        });
      }
      
      // Attach user details to the request object (excluding credentials)
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name
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
