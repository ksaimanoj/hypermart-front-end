require('dotenv').config();
const items = require('./items_file_parser');
const { Pool } = require('pg');

// Use shared connection string from env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Insert items, ignore on conflict (assumes 'item_code' is unique)

async function insertItems(items) {
  const client = await pool.connect();
  let insertedCount = 0;
  try {
    const query = `
      INSERT INTO items (
        item_id, item_name, brand, purchase_cost, selling_price, category
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      ON CONFLICT (item_id) DO NOTHING;
    `;
    for (const item of items) {
      try {
        const result = await client.query(query, [
          item['Item Code'],
          item['Item Name'],
          item['Brand'],
          item['Purchase Cost'],
          item['Selling Price'],
          item['Category Code']
        ]);
        if (result.rowCount === 1) insertedCount++;
      } catch (singleErr) {
        // Ignore single insert failure, optionally log
        console.warn('Insert failed for item:', item['Item Code'], singleErr.message);
      }
    }
    console.log(`Items inserted: ${insertedCount}`);
    return insertedCount;
  } catch (err) {
    console.error('Error inserting items:', err);
    return 0;
  } finally {
    client.release();
    await pool.end();
  }
}

// Call the function
insertItems(items);
