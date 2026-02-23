const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM salesmen ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { salesman_name, phone, cnic, assigned_area, commission } = req.body;
  db.query("INSERT INTO salesmen (salesman_name, phone, cnic, assigned_area, commission) VALUES (?,?,?,?,?)",
    [salesman_name, phone, cnic, assigned_area, commission], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Salesman saved!", id: result.insertId });
    });
});

router.put("/:id", (req, res) => {
  const { salesman_name, phone, cnic, assigned_area, commission } = req.body;
  db.query(
    "UPDATE salesmen SET salesman_name = ?, phone = ?, cnic = ?, assigned_area = ?, commission = ? WHERE id = ?",
    [salesman_name, phone, cnic, assigned_area, commission, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Salesman updated!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query("DELETE FROM salesmen WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted!" });
  });
});

module.exports = router;
