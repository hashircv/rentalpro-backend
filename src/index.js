const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('Allowed Origins:', allowedOrigins);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const propertiesRoutes = require('./routes/properties');
const unitsRoutes = require('./routes/units');
const tenantsRoutes = require('./routes/tenants');
const agreementsRoutes = require('./routes/agreements');
const paymentsRoutes = require('./routes/payments');
const expensesRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');
const reportsRoutes = require('./routes/reports');
const notificationsRoutes = require('./routes/notifications');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/agreements', agreementsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Rental Property Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
