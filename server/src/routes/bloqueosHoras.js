// server/src/routes/bloqueosHoras.js
const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

/**
 * GET /bloqueos-horas?fechaISO=YYYY-MM-DD
 * - Si viene fechaISO, trae solo los bloqueos de ese día
 * - Si no, trae todos (por ahora no lo usamos en el front)
 */
router.get("/", async (req, res) => {
  try {
    const { fechaISO } = req.query;

    let rows;
    if (fechaISO) {
      [rows] = await pool.query(
        `SELECT id, fechaISO, hora, motivo
         FROM bloqueos_horas
         WHERE fechaISO = ?
         ORDER BY hora`,
        [fechaISO]
      );
    } else {
      [rows] = await pool.query(
        `SELECT id, fechaISO, hora, motivo
         FROM bloqueos_horas
         ORDER BY fechaISO DESC, hora ASC`
      );
    }

    return res.json({ ok: true, bloqueos: rows });
  } catch (err) {
    console.error("Error GET /bloqueos-horas:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al obtener bloqueos de horas" });
  }
});

/**
 * POST /bloqueos-horas
 * Body esperado: { fechaISO: 'YYYY-MM-DD', hora: 'HH:mm', motivo?: string }
 */
router.post("/", async (req, res) => {
  try {
    const { fechaISO, hora, motivo = "Bloqueo manual" } = req.body;

    if (!fechaISO || !hora) {
      return res.status(400).json({
        ok: false,
        error: "Los campos 'fechaISO' y 'hora' son obligatorios",
      });
    }

    // Usamos INSERT IGNORE por si ya existe ese bloqueo (único por fechaISO+hora)
    await pool.query(
      `
      INSERT IGNORE INTO bloqueos_horas (fechaISO, hora, motivo)
      VALUES (?, ?, ?)
      `,
      [fechaISO, hora, motivo]
    );

    const [rows] = await pool.query(
      `SELECT id, fechaISO, hora, motivo
       FROM bloqueos_horas
       WHERE fechaISO = ? AND hora = ?
       LIMIT 1`,
      [fechaISO, hora]
    );

    return res.status(201).json({ ok: true, bloqueo: rows[0] || null });
  } catch (err) {
    console.error("Error POST /bloqueos-horas:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al crear bloqueo de hora" });
  }
});

/**
 * DELETE /bloqueos-horas/:fechaISO/:hora
 * Elimina un bloqueo de una hora específica en una fecha.
 */
router.delete("/:fechaISO/:hora", async (req, res) => {
  try {
    const { fechaISO, hora } = req.params;

    if (!fechaISO || !hora) {
      return res.status(400).json({
        ok: false,
        error: "Debe enviar fechaISO y hora en la URL",
      });
    }

    await pool.query(
      `DELETE FROM bloqueos_horas
       WHERE fechaISO = ? AND hora = ?`,
      [fechaISO, hora]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE /bloqueos-horas/:fechaISO/:hora:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al eliminar bloqueo de hora" });
  }
});

module.exports = router;
