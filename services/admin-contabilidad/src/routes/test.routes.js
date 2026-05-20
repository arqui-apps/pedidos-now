const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');

router.get('/test-db', async (req, res) => {
    try {
        const result = await sequelize.query('SELECT NOW() as now');
        res.json({
            ok: true,
            db_time: result[0][0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: 'Error conectando a la BD'
        });
    }
});

module.exports = router;