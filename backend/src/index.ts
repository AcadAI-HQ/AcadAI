import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import routes
import healthRoutes from './routes/health';
import paymentRoutes from './routes/payment';
import webhookRoutes from './routes/webhook';
import aiMentorRoutes from './routes/ai-mentor';
import hyperpersonalizationRoutes from './routes/hyperpersonalization';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - supports comma-separated origins in CORS_ORIGIN
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:9002')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// Raw body parser for webhooks (must be before json parser for these routes)
app.use('/api/webhook', express.raw({
  type: 'application/json',
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// JSON parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/ai-mentor', aiMentorRoutes);
app.use('/api/hyperpersonalization', hyperpersonalizationRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AcadAI Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      payment: {
        pricing: 'GET /api/payment/pricing',
        checkout: 'POST /api/payment/checkout',
        checkoutStatus: 'GET /api/payment/checkout-status',
        cancel: 'POST /api/payment/cancel',
      },
      webhook: 'POST /api/webhook/dodo-payments',
      aiMentor: {
        chat: 'POST /api/ai-mentor/chat',
      },
      hyperpersonalization: {
        start: 'POST /api/hyperpersonalization/start',
        generate: 'POST /api/hyperpersonalization/generate',
        reset: 'POST /api/hyperpersonalization/reset',
        status: 'GET /api/hyperpersonalization/status',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`DodoPayments: ${process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode'}`);
});

export default app;
