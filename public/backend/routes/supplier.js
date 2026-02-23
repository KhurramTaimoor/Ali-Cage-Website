const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM suppliers ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { name, company_name, contact, email, city, opening_balance } = req.body;
  if (!name) return res.status(400).json({ error: "Supplier name zaroori hai!" });
  db.query(
    "INSERT INTO suppliers (name, company_name, contact, email, city, opening_balance) VALUES (?, ?, ?, ?, ?, ?)",
    [name, company_name || "", contact || "", email || "", city || "", parseFloat(opening_balance) || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Supplier save ho gaya!", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { name, company_name, contact, email, city, opening_balance } = req.body;
  db.query(
    "UPDATE suppliers SET name=?, company_name=?, contact=?, email=?, city=?, opening_balance=? WHERE id=?",
    [name, company_name || "", contact || "", email || "", city || "", parseFloat(opening_balance) || 0, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Supplier update ho gaya!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM suppliers WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Supplier delete ho gaya!" });
  });
});

module.exports = router;
