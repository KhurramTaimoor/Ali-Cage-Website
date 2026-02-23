const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET - sab categories lao (product_type ke sath)
router.get('/', (req, res) => {
  const sql = `
    SELECT c.*, pt.type_name, pt.short_code
    FROM categories c
    LEFT JOIN product_types pt ON c.product_type_id = pt.id
    ORDER BY c.id ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET - specific product type ki categories
router.get('/by-type/:typeId', (req, res) => {
  db.query('SELECT * FROM categories WHERE product_type_id = ?', [req.params.typeId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST - naya category save karo
router.post('/', (req, res) => {
  const { category_name, product_type_id, description } = req.body;

  if (!category_name || !product_type_id) {
    return res.status(400).json({ error: 'Category name aur Product Type required hain' });
  }

  const sql = 'INSERT INTO categories (category_name, product_type_id, description) VALUES (?, ?, ?)';
  db.query(sql, [category_name, product_type_id, description || ''], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Category save ho gayi!', id: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const { category_name, product_type_id, description } = req.body;

  if (!category_name || !product_type_id) {
    return res.status(400).json({ error: 'Category name aur Product Type required hain' });
  }

  const sql = 'UPDATE categories SET category_name = ?, product_type_id = ?, description = ? WHERE id = ?';
  db.query(sql, [category_name, product_type_id, description || '', req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Category update ho gayi!' });
  });
});

// DELETE
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM categories WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Delete ho gaya!' });
  });
});

module.exports = router;
