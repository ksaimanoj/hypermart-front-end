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
    const sort = req.query.sort || 'item_id';
    const uncategorizedOnly = req.query.uncategorized === 'true';

        // Determine sort column
        let sortColumn = 'item_id';
        let sortJoin = '';
        let selectExtra = ', COALESCE(s.total_sales,0) AS total_sales, COALESCE(q.total_quantity,0) AS total_quantity';

        // Always join for sales and quantity
        sortJoin = `LEFT JOIN (
            SELECT item_id, COALESCE(SUM(sr.total_item_price),0) AS total_sales
            FROM items i LEFT JOIN sale_record sr ON sr.item_code::integer = i.item_id
            GROUP BY i.item_id
        ) s ON items.item_id = s.item_id
        LEFT JOIN (
            SELECT item_id, COALESCE(SUM(sr.quantity),0) AS total_quantity
            FROM items i LEFT JOIN sale_record sr ON sr.item_code::integer = i.item_id
            GROUP BY i.item_id
        ) q ON items.item_id = q.item_id`;

        if (sort === 'sales') {
            sortColumn = 'total_sales';
        } else if (sort === 'quantity') {
            sortColumn = 'total_quantity';
        }

        // Build WHERE clause for uncategorized filter
        let whereClause = '';
        let countParams = [];
        let itemsParams = [pageSize, offset];
        if (uncategorizedOnly) {
            whereClause = `WHERE items.category = 'uncategorized'`;
        }

        // Get total count (with filter)
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM items ${whereClause}`,
            countParams
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get paginated and sorted items (with filter)
        const itemsResult = await pool.query(
            `SELECT items.item_id, items.item_name, items.brand, items.category${selectExtra}
             FROM items
             ${sortJoin}
             ${whereClause}
             ORDER BY ${sortColumn} DESC
             LIMIT $1 OFFSET $2`,
            itemsParams
        );

        res.json({ items: itemsResult.rows, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;