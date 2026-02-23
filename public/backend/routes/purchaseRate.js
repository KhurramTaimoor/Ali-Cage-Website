const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const query = `
    SELECT 
      pr.id,
      pr.supplier_id,
      pr.product_id,
      pr.unit_id,
      pr.rate,
      pr.effective_date,
      s.name AS supplier_name,
      p.product_name,
      u.unit_name
    FROM purchase_rates pr
    LEFT JOIN suppliers s ON pr.supplier_id = s.id
    LEFT JOIN products p ON pr.product_id = p.id
    LEFT JOIN units u ON pr.unit_id = u.id
    ORDER BY pr.id DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { supplier_id, product_id, unit_id, rate, effective_date } = req.body;
  if (!supplier_id || !product_id || !rate) {
    return res.status(400).json({ error: "Supplier, product aur rate zaroori hain!" });
  }
  const today = new Date().toISOString().slice(0, 10);
  db.query(
    "INSERT INTO purchase_rates (supplier_id, product_id, unit_id, rate, effective_date) VALUES (?, ?, ?, ?, ?)",
    [supplier_id, product_id, unit_id || null, parseFloat(rate), effective_date || today],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Purchase rate save ho gaya!", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { supplier_id, product_id, unit_id, rate, effective_date } = req.body;
  db.query(
    "UPDATE purchase_rates SET supplier_id=?, product_id=?, unit_id=?, rate=?, effective_date=? WHERE id=?",
    [supplier_id, product_id, unit_id || null, parseFloat(rate), effective_date, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Purchase rate update ho gaya!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM purchase_rates WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Purchase rate delete ho gaya!" });
  });
});

module.exports = router;
