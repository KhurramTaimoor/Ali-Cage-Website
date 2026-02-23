const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET - sab products lao
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      p.*,
      pt.type_name, pt.short_code,
      c.category_name
    FROM products p
    LEFT JOIN product_types pt ON p.product_type_id = pt.id
    LEFT JOIN categories     c  ON p.category_id     = c.id
    ORDER BY p.id ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST - naya product save karo
router.post('/', (req, res) => {
  const { product_name, product_type_id, category_id, unit, purchase_rate, sale_rate, reorder_level } = req.body;

  if (!product_name || !product_type_id || !category_id || !unit) {
    return res.status(400).json({ error: 'Zaroori fields missing hain' });
  }

  const sql = `
    INSERT INTO products 
      (product_name, product_type_id, category_id, unit, purchase_rate, sale_rate, reorder_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [product_name, product_type_id, category_id, unit, purchase_rate || 0, sale_rate || 0, reorder_level || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Product save ho gaya!', id: result.insertId });
  });
});

// PUT - product update karo
router.put('/:id', (req, res) => {
  const { product_name, product_type_id, category_id, unit, purchase_rate, sale_rate, reorder_level } = req.body;
  const sql = `
    UPDATE products SET
      product_name    = ?,
      product_type_id = ?,
      category_id     = ?,
      unit            = ?,
      purchase_rate   = ?,
      sale_rate       = ?,
      reorder_level   = ?
    WHERE id = ?
  `;
  db.query(sql, [product_name, product_type_id, category_id, unit, purchase_rate, sale_rate, reorder_level, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Product update ho gaya!' });
  });
});

// DELETE
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Delete ho gaya!' });
  });
});

module.exports = router;