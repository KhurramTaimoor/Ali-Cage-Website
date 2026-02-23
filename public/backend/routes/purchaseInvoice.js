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
      pi.id,
      pi.invoice_no,
      DATE_FORMAT(pi.invoice_date, '%d/%m/%Y') AS invoice_date,
      pi.total_amount,
      pi.status,
      s.name AS supplier_name
    FROM purchase_invoices pi
    LEFT JOIN suppliers s ON pi.supplier_id = s.id
    ORDER BY pi.id DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  db.query("SELECT * FROM purchase_invoices WHERE id = ?", [req.params.id], (err, invoice) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!invoice.length) return res.status(404).json({ error: "Invoice nahi mila!" });
    db.query(
      `SELECT pii.*, p.product_name FROM purchase_invoice_items pii
       LEFT JOIN products p ON pii.product_id = p.id
       WHERE pii.invoice_id = ?`,
      [req.params.id],
      (err2, items) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ ...invoice[0], items });
      }
    );
  });
});

router.post("/", (req, res) => {
  const { invoice_no, supplier_id, invoice_date, total_amount, status, items } = req.body;
  if (!invoice_no || !supplier_id) {
    return res.status(400).json({ error: "Invoice no aur supplier zaroori hain!" });
  }
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    "INSERT INTO purchase_invoices (invoice_no, supplier_id, invoice_date, total_amount, status) VALUES (?, ?, ?, ?, ?)",
    [invoice_no, supplier_id, formatDate(invoice_date) || today, parseFloat(total_amount) || 0, status || "pending"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      const invoiceId = result.insertId;
      if (items && items.length > 0) {
        const itemValues = items.map(i => [invoiceId, i.product_id, parseFloat(i.quantity), parseFloat(i.rate), parseFloat(i.amount)]);
        db.query(
          "INSERT INTO purchase_invoice_items (invoice_id, product_id, quantity, rate, amount) VALUES ?",
          [itemValues],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: "Purchase invoice save ho gaya!", id: invoiceId });
          }
        );
      } else {
        res.json({ message: "Purchase invoice save ho gaya!", id: invoiceId });
      }
    }
  );
});

router.put("/:id", (req, res) => {
  const { invoice_no, supplier_id, invoice_date, total_amount, status } = req.body;
  db.query(
    "UPDATE purchase_invoices SET invoice_no=?, supplier_id=?, invoice_date=?, total_amount=?, status=? WHERE id=?",
    [invoice_no, supplier_id, formatDate(invoice_date), parseFloat(total_amount) || 0, status || "pending", req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Purchase invoice update ho gaya!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM purchase_invoice_items WHERE invoice_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query("DELETE FROM purchase_invoices WHERE id = ?", [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Invoice delete ho gaya!" });
    });
  });
});

module.exports = router;
