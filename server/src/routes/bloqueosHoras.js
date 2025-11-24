// server/src/routes/bloqueosHoras.js
const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

/**
 * GET /bloqueos-horas?fecha=YYYY-MM-DD
 */
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;
    let rows;

    if (fecha) {
      [rows] = await pool.query(
        "SELECT * FROM bloqueos_horas WHERE fechaISO = ? ORDER BY hora",
        [fecha]
      );
    } else {
      [rows] = await pool.query(
        "SELECT * FROM bloqueos_horas ORDER BY fechaISO, hora"
      );
    }

    return res.json({ ok: true, bloqueos: rows });
  } catch (err) {
    console.error("Error GET /bloqueos-horas:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al obtener bloqueos de hora" });
  }
});

/**
 * POST /bloqueos-horas
 */
router.post("/", async (req, res) => {
  try {
    const { fechaISO, hora, motivo } = req.body;

    const [result] = await pool.query(
      `INSERT INTO bloqueos_horas (fechaISO, hora, motivo)
       VALUES (?, ?, ?)`,
      [fechaISO, hora, motivo]
    );

    const [rows] = await pool.query(
      "SELECT * FROM bloqueos_horas WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ ok: true, bloqueo: rows[0] });
  } catch (err) {
    console.error("Error POST /bloqueos-horas:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al crear bloqueo de hora" });
  }
});

/**
 * DELETE /bloqueos-horas/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM bloqueos_horas WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE /bloqueos-horas/:id:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al eliminar bloqueo de hora" });
  }
});

module.exports = router;
