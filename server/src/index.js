const express = require('express');
const { corsMiddleware } = require('./middleware/cors');
const apiRoutes = require('./routes/api');
const metricsRoutes = require('./routes/metrics');
const config = require('./config');

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api', apiRoutes);
app.use('/api/metrics', metricsRoutes);

// Start server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`Backend running on port ${config.port}`);
});
