import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req: Request, res: Response) => {
  // Mock login: In a production app, verify email/password or use OAuth
  const mockUser = { id: 'u001', role: 'student' };
  
  const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
  const token = jwt.sign(mockUser, secret, { expiresIn: '1h' });

  // Set the JWT in an httpOnly, secure cookie
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });

  res.json({ message: "Successfully logged in", user: mockUser });
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.json({ message: "Successfully logged out" });
});

export default router;
