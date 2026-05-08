//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

router.get('/reportes', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Reportes de promociones funcionando'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
