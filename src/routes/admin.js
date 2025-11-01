const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Example API endpoint for fetching items
// Server-side pagination for items
router.get('/api/items', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 100;
        const offset = (page - 1) * pageSize;

        // Get total count
        const countResult = await pool.query('SELECT COUNT(*) FROM items');
        const total = parseInt(countResult.rows[0].count, 10);

        // Get paginated items
        const itemsResult = await pool.query(
            'SELECT item_id, item_name, brand, category FROM items ORDER BY item_id desc LIMIT $1 OFFSET $2',
            [pageSize, offset]
        );

        res.json({ items: itemsResult.rows, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;