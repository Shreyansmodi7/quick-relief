import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export const pharmacist = (req, res, next) => {
  if (req.user && (req.user.role === 'pharmacist' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a pharmacist' });
  }
};

export const delivery = (req, res, next) => {
  if (req.user && (req.user.role === 'delivery' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a delivery partner' });
  }
};
