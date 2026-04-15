require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const certificateRoutes = require('./routes/certificates');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();

// ======================
// PORT
// ======================
const PORT = process.env.PORT || 5000;

// ======================
// SECURITY MIDDLEWARE
// ======================
app.use(helmet());

// CORS (PRODUCTION FIXED)
app.use(cors({
  origin: "https://health-certificate-igbc.onrender.com",
  credentials: true
}));

// JSON LIMIT
app.use(express.json({ limit: '10kb' }));

// ======================
// RATE LIMITING
// ======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

app.use('/api/', limiter);

// AUTH LIMITER
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts' }
});

app.use('/api/auth', authLimiter);

// ======================
// ROUTES
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// ======================
// HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running'
  });
});

// ======================
// ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
