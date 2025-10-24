const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false } // Neon requires SSL
});

router.get('/', (req, res) => {
    res.send('Welcome to Hyper Mart!');
});


router.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const path = require('path');

// Serve the sales HTML page
router.get('/sales', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/sales.html'));
});

// API endpoint to get sales data as JSON
router.get('/api/sales', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT date, sum(sr.total_item_price) as sum FROM sale_record sr';
    const params = [];
    if (start_date && end_date) {
      query += ' WHERE date BETWEEN $1 AND $2';
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ' WHERE date >= $1';
      params.push(start_date);
    } else if (end_date) {
      query += ' WHERE date <= $1';
      params.push(end_date);
    }
    query += ' GROUP BY date ORDER BY date DESC;';
  console.log('SALES QUERY:', query, params);
  const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve the daywise sales HTML page
router.get('/daywise_sales', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/daywise_sales.html'));
});

// API endpoint to get daywise sales data as JSON
router.get('/api/daywise_sales', async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      `SELECT category_name, item_name, sum(total_item_price) as total_sales, sum(quantity) as count
       FROM sale_record
       WHERE date = $1
       GROUP BY category_name, item_name
       ORDER BY total_sales DESC;`, [date]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.get('/sales', async (req, res) => {
//   try {
//     const result = await pool.query('select date, sum(sr.total_item_price ) from sale_record sr group by date order by date desc;');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;