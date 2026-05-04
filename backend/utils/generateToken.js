import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });

  return token; // For this project, we'll send it back in the JSON response instead of a cookie for easier mobile app simulation
};

export default generateToken;
