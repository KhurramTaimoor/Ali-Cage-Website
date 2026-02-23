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
      pr.id,
      pr.invoice_id,
      pr.return_date,
      pr.reason,
      pr.total_amount,
      pi.invoice_no,
      s.name AS supplier_name
    FROM purchase_returns pr
    LEFT JOIN purchase_invoices pi ON pr.invoice_id = pi.id
    LEFT JOIN suppliers s ON pi.supplier_id = s.id
    ORDER BY pr.id DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { invoice_id, return_date, reason, total_amount } = req.body;
  if (!invoice_id) return res.status(400).json({ error: "Invoice zaroori hai!" });
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    "INSERT INTO purchase_returns (invoice_id, return_date, reason, total_amount) VALUES (?, ?, ?, ?)",
    [invoice_id, formatDate(return_date) || today, reason || "", parseFloat(total_amount) || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Purchase return save ho gaya!", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { invoice_id, return_date, reason, total_amount } = req.body;
  db.query(
    "UPDATE purchase_returns SET invoice_id=?, return_date=?, reason=?, total_amount=? WHERE id=?",
    [invoice_id, formatDate(return_date), reason || "", parseFloat(total_amount) || 0, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Purchase return update ho gaya!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM purchase_returns WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Purchase return delete ho gaya!" });
  });
});

module.exports = router;
