const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all stock issues
router.get("/", (req, res) => {
  const sql = `
    SELECT si.*, p.product_name, d.department_name 
    FROM stock_issue si
    LEFT JOIN products p ON si.product_id = p.id
    LEFT JOIN departments d ON si.department_id = d.id
    ORDER BY si.id DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST new stock issue
router.post("/", (req, res) => {
  const { issue_no, date, department_id, product_id, product_type_id, issued_qty, rate, remarks } = req.body;
  const qty = parseFloat(issued_qty) || 0;
  const itemRate = parseFloat(rate) || 0;
  const total = (qty * itemRate).toFixed(2);
  const sql = `INSERT INTO stock_issue (issue_no, date, department_id, product_id, product_type_id, issued_qty, rate, total, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [issue_no, date, department_id, product_id, product_type_id, qty, itemRate, total, remarks], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Stock issue saved!", id: result.insertId });
  });
});

router.put("/:id", (req, res) => {
  const { issue_no, date, department_id, product_id, product_type_id, issued_qty, rate, remarks } = req.body;
  const qty = parseFloat(issued_qty) || 0;
  const itemRate = parseFloat(rate) || 0;
  const total = (qty * itemRate).toFixed(2);
  const sql = `UPDATE stock_issue SET issue_no = ?, date = ?, department_id = ?, product_id = ?, product_type_id = ?, issued_qty = ?, rate = ?, total = ?, remarks = ? WHERE id = ?`;
  db.query(sql, [issue_no, date, department_id, product_id, product_type_id, qty, itemRate, total, remarks, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Stock issue updated!" });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM stock_issue WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted!" });
  });
});

module.exports = router;
