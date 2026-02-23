const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const query = `
    SELECT 
      so.id,
      so.order_no,
      so.customer_id,
      c.customer_name,
      DATE_FORMAT(so.order_date, '%d/%m/%Y') AS order_date,
      DATE_FORMAT(so.delivery_date, '%d/%m/%Y') AS delivery_date,
      so.order_qty,
      so.rate,
      so.total_amount,
      so.status
    FROM sale_orders so
    LEFT JOIN customers c ON so.customer_id = c.id
    ORDER BY so.id DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { order_no, customer_id, order_date, delivery_date, order_qty, rate, status } = req.body;
  if (!order_no || !customer_id) {
    return res.status(400).json({ error: "order_no aur customer zaroori hain!" });
  }
  const qty = parseFloat(order_qty) || 0;
  const itemRate = parseFloat(rate) || 0;
  const total = (qty * itemRate).toFixed(2);
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    `INSERT INTO sale_orders (order_no, customer_id, order_date, delivery_date, order_qty, rate, total_amount, status) VALUES (?,?,?,?,?,?,?,?)`,
    [order_no, customer_id, order_date || today, delivery_date || today, qty, itemRate, total, status || "pending"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Sale order save ho gaya!", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { order_no, customer_id, order_date, delivery_date, order_qty, rate, status } = req.body;
  if (!order_no || !customer_id) {
    return res.status(400).json({ error: "order_no aur customer zaroori hain!" });
  }
  const qty = parseFloat(order_qty) || 0;
  const itemRate = parseFloat(rate) || 0;
  const total = (qty * itemRate).toFixed(2);
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    `UPDATE sale_orders
     SET order_no = ?, customer_id = ?, order_date = ?, delivery_date = ?, order_qty = ?, rate = ?, total_amount = ?, status = ?
     WHERE id = ?`,
    [order_no, customer_id, order_date || today, delivery_date || today, qty, itemRate, total, status || "pending", req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Sale order update ho gaya!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM sale_orders WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted!" });
  });
});

module.exports = router;
