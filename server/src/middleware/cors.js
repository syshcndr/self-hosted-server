const cors = require('cors');
const config = require('../config');

const corsMiddleware = cors({
  origin: config.corsOrigins,
});

module.exports = { corsMiddleware };
