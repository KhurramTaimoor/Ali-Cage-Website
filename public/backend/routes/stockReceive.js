const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query(`
    SELECT sr.*, p.product_name, pt.type_name
    FROM stock_receive sr
    LEFT JOIN products p ON sr.product_id = p.id
    LEFT JOIN product_types pt ON sr.product_type_id = pt.id
    ORDER BY sr.id ASC
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { grn_no, receive_date, supplier, warehouse, product_id, product_type_id, received_qty, rate, total } = req.body;
  if (!grn_no || !receive_date || !product_id || !received_qty || !rate) {
    return res.status(400).json({ error: 'Sab required fields bharein' });
  }
  const sql = 'INSERT INTO stock_receive (grn_no, receive_date, supplier, warehouse, product_id, product_type_id, received_qty, rate, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [grn_no, receive_date, supplier, warehouse, product_id, product_type_id, received_qty, rate, total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Stock Receive save ho gaya!', id: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const { grn_no, receive_date, supplier, warehouse, product_id, product_type_id, received_qty, rate, total } = req.body;
  if (!grn_no || !receive_date || !product_id || !received_qty || !rate) {
    return res.status(400).json({ error: 'Sab required fields bharein' });
  }
  const sql = 'UPDATE stock_receive SET grn_no = ?, receive_date = ?, supplier = ?, warehouse = ?, product_id = ?, product_type_id = ?, received_qty = ?, rate = ?, total = ? WHERE id = ?';
  db.query(sql, [grn_no, receive_date, supplier, warehouse, product_id, product_type_id, received_qty, rate, total, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Stock Receive update ho gaya!' });
  });
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM stock_receive WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Delete ho gaya!' });
  });
});

module.exports = router;
