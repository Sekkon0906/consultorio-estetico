// server/src/routes/procedimientos.js
const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

// ============================
// GET /procedimientos
// ============================
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM procedimientos");
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error GET /procedimientos:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al obtener procedimientos" });
  }
});

// ============================
// POST /procedimientos
// (crear desde el panel admin)
// ============================
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      desc,
      precio,
      imagen,
      categoria,
      duracionMin,
      destacado,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO procedimientos 
       (nombre, \`desc\`, precio, imagen, categoria, duracionMin, destacado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        desc,
        precio,
        imagen,
        categoria,
        duracionMin || null,
        destacado ? 1 : 0,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM procedimientos WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("Error POST /procedimientos:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al crear procedimiento" });
  }
});

// ============================
// PUT /procedimientos/:id
// ============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      desc,
      precio,
      imagen,
      categoria,
      duracionMin,
      destacado,
    } = req.body;

    await pool.query(
      `UPDATE procedimientos
       SET nombre = ?, \`desc\` = ?, precio = ?, imagen = ?, categoria = ?, 
           duracionMin = ?, destacado = ?
       WHERE id = ?`,
      [
        nombre,
        desc,
        precio,
        imagen,
        categoria,
        duracionMin || null,
        destacado ? 1 : 0,
        id,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM procedimientos WHERE id = ?",
      [id]
    );

    return res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("Error PUT /procedimientos/:id:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al actualizar procedimiento" });
  }
});

// ============================
// DELETE /procedimientos/:id
// ============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM procedimientos WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE /procedimientos/:id:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al eliminar procedimiento" });
  }
});

module.exports = router;
