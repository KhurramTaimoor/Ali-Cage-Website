const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { from_date, to_date, customer_id, salesman_id } = req.query;
  let query = `
    SELECT 
      si.id,
      si.invoice_no,
      DATE_FORMAT(si.invoice_date, '%d/%m/%Y') AS invoice_date,
      c.customer_name,
      s.salesman_name,
      si.gross_amount,
      si.discount,
      si.net_total
    FROM sale_invoices si
    LEFT JOIN customers c ON si.customer_id = c.id
    LEFT JOIN salesmen s ON si.salesman_id = s.id
    WHERE 1=1
  `;
  const params = [];
  if (from_date) { query += " AND si.invoice_date >= ?"; params.push(from_date); }
  if (to_date) { query += " AND si.invoice_date <= ?"; params.push(to_date); }
  if (customer_id) { query += " AND si.customer_id = ?"; params.push(customer_id); }
  if (salesman_id) { query += " AND si.salesman_id = ?"; params.push(salesman_id); }
  query += " ORDER BY si.id DESC";
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
