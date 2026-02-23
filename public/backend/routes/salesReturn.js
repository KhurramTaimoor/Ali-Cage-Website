const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const query = `
    SELECT 
      sr.id,
      sr.return_no,
      sr.invoice_ref,
      sr.customer_id,
      c.customer_name,
      DATE_FORMAT(sr.return_date, '%d/%m/%Y') AS return_date,
      sr.return_qty,
      sr.rate,
      sr.return_amount,
      sr.reason
    FROM sales_returns sr
    LEFT JOIN customers c ON sr.customer_id = c.id
    ORDER BY sr.id DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { return_no, invoice_ref, customer_id, return_date, return_qty, rate, reason } = req.body;
  if (!return_no || !customer_id) {
    return res.status(400).json({ error: "return_no aur customer zaroori hain!" });
  }
  const qty = parseFloat(return_qty) || 0;
  const itemRate = parseFloat(rate) || 0;
  const amount = (qty * itemRate).toFixed(2);
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    `INSERT INTO sales_returns (return_no, invoice_ref, customer_id, return_date, return_qty, rate, return_amount, reason) VALUES (?,?,?,?,?,?,?,?)`,
    [return_no, invoice_ref, customer_id, return_date || today, qty, itemRate, amount, reason],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Sales return save ho gaya!", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { return_no, invoice_ref, customer_id, return_date, return_qty, rate, reason } = req.body;
  if (!return_no || !customer_id) {
    return res.status(400).json({ error: "return_no aur customer zaroori hain!" });
  }
  const qty = parseFloat(return_qty) || 0;
  const itemRate = parseFloat(rate) || 0;
  const amount = (qty * itemRate).toFixed(2);
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    `UPDATE sales_returns
     SET return_no = ?, invoice_ref = ?, customer_id = ?, return_date = ?, return_qty = ?, rate = ?, return_amount = ?, reason = ?
     WHERE id = ?`,
    [return_no, invoice_ref, customer_id, return_date || today, qty, itemRate, amount, reason, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Sales return update ho gaya!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM sales_returns WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted!" });
  });
});

module.exports = router;
