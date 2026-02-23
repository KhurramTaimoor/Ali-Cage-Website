const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM sales_rates ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { product_item, unit, retail_rate, wholesale_rate, distributor_rate } = req.body;
  db.query(
    "INSERT INTO sales_rates (product_item, unit, retail_rate, wholesale_rate, distributor_rate) VALUES (?,?,?,?,?)",
    [product_item, unit, retail_rate || 0, wholesale_rate || 0, distributor_rate || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Rate saved!", id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { product_item, unit, retail_rate, wholesale_rate, distributor_rate } = req.body;
  db.query(
    "UPDATE sales_rates SET product_item = ?, unit = ?, retail_rate = ?, wholesale_rate = ?, distributor_rate = ? WHERE id = ?",
    [product_item, unit, retail_rate || 0, wholesale_rate || 0, distributor_rate || 0, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Rate updated!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM sales_rates WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted!" });
  });
});

module.exports = router;
