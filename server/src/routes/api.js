const { Router } = require('express');
const router = Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'I Am Alive Master Suyash!' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

module.exports = router;
