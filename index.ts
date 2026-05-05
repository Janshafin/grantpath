import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import findRouter from './api/routes/find.js';
import draftRouter from './api/routes/draft.js';
import scholarshipsRouter from './api/routes/scholarships.js';
import authRouter from './api/routes/auth.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175`, `https://client-rho-eight-23.vercel.app`
];

app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) or if it's in the allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/find', findRouter);
app.use('/api/draft', draftRouter);
app.use('/api/scholarships', scholarshipsRouter);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`GrantPath Backend running on port ${PORT}`);
  });
}

export default app;
