const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET - sab product types lao (type_code ke hisaab se ascending order)
router.get('/', (req, res) => {
  db.query('SELECT * FROM product_types ORDER BY type_code ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST - naya product type save karo
router.post('/', (req, res) => {
  const { type_code, type_name, short_code } = req.body;

  if (!type_code || !type_name || !short_code) {
    return res.status(400).json({ error: 'Sab fields required hain' });
  }

  const sql = 'INSERT INTO product_types (type_code, type_name, short_code) VALUES (?, ?, ?)';
  db.query(sql, [type_code, type_name, short_code], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Product Type save ho gaya!', id: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const { type_code, type_name, short_code } = req.body;

  if (!type_code || !type_name || !short_code) {
    return res.status(400).json({ error: 'Sab fields required hain' });
  }

  const sql = 'UPDATE product_types SET type_code = ?, type_name = ?, short_code = ? WHERE id = ?';
  db.query(sql, [type_code, type_name, short_code, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product Type update ho gaya!' });
  });
});

// DELETE - product type delete karo
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM product_types WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Delete ho gaya!' });
  });
});

module.exports = router;
