const express = require("express");
const router = express.Router();
const db = require("../db");

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toISOString().slice(0, 10);
};

router.get("/", (req, res) => {
  const query = `
    SELECT 
      si.id,
      si.invoice_no,
      si.customer_id,
      si.salesman_id,
      DATE_FORMAT(si.invoice_date, '%d/%m/%Y') AS invoice_date,
      si.discount,
      si.net_total,
      si.gross_amount,
      c.customer_name,
      s.salesman_name
    FROM sale_invoices si
    LEFT JOIN customers c ON si.customer_id = c.id
    LEFT JOIN salesmen s ON si.salesman_id = s.id
    ORDER BY si.id DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { invoice_no, customer_id, invoice_date, salesman_id, gross_amount, discount } = req.body;
  if (!invoice_no || !customer_id || !salesman_id) {
    return res.status(400).json({ error: "invoice_no, customer_id, aur salesman_id zaroori hain!" });
  }
  const gross = parseFloat(gross_amount) || 0;
  const disc = parseFloat(discount) || 0;
  const net = Math.max(gross - disc, 0).toFixed(2);
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    `INSERT INTO sale_invoices (invoice_no, customer_id, invoice_date, date, salesman_id, gross_amount, discount, net_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [invoice_no, customer_id, formatDate(invoice_date) || today, today, salesman_id, gross, disc, net],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Invoice save ho gaya!", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { invoice_no, customer_id, invoice_date, salesman_id, gross_amount, discount } = req.body;
  const gross = parseFloat(gross_amount) || 0;
  const disc = parseFloat(discount) || 0;
  const net = Math.max(gross - disc, 0).toFixed(2);
  db.query(
    `UPDATE sale_invoices SET invoice_no=?, customer_id=?, invoice_date=?, salesman_id=?, gross_amount=?, discount=?, net_total=? WHERE id=?`,
    [invoice_no, customer_id, formatDate(invoice_date), salesman_id, gross, disc, net, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Invoice update ho gaya!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM sale_invoices WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Invoice delete ho gaya!" });
  });
});

module.exports = router;
