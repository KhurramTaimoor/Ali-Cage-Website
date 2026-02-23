const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM customers ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { customer_name, phone, city, address, credit_limit } = req.body;
  db.query("INSERT INTO customers (customer_name, phone, city, address, credit_limit) VALUES (?,?,?,?,?)",
    [customer_name, phone, city, address, credit_limit], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Customer saved!", id: result.insertId });
    });
});

router.put("/:id", (req, res) => {
  const { customer_name, phone, city, address, credit_limit } = req.body;
  db.query(
    "UPDATE customers SET customer_name = ?, phone = ?, city = ?, address = ?, credit_limit = ? WHERE id = ?",
    [customer_name, phone, city, address, credit_limit, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Customer updated!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM customers WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted!" });
  });
});

module.exports = router;
