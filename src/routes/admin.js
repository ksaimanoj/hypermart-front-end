const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Example API endpoint for fetching items
router.get('/api/items', async (req, res) => {
    try {
        const result = await pool.query('SELECT item_id, item_name, brand, category FROM items ORDER BY item_id desc');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;