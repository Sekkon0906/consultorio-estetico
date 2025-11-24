// server/src/routes/ingresos.js
const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

/**
 * GET /ingresos/totales?year=2025&month=2  (month: 0-11)
 * Devuelve totales de un mes: online, consultorio y esperado.
 */
router.get("/totales", async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const monthIdx = parseInt(req.query.month, 10); // 0-11 desde el front

    if (Number.isNaN(year) || Number.isNaN(monthIdx)) {
      return res
        .status(400)
        .json({ ok: false, error: "Parámetros year y month son requeridos" });
    }

    const month = monthIdx + 1; // MySQL usa 1-12

    const [rows] = await pool.query(
      `
      SELECT
        SUM(
          CASE
            WHEN metodoPago = 'Online' THEN COALESCE(montoPagado, 0)
            ELSE 0
          END
        ) AS totalOnline,
        SUM(
          CASE
            WHEN metodoPago = 'Consultorio' THEN COALESCE(montoPagado, 0)
            ELSE 0
          END
        ) AS totalConsultorio,
        SUM(COALESCE(monto, 0)) AS totalEsperado
      FROM citas
      WHERE estado = 'atendida'
        AND YEAR(fecha) = ?
        AND MONTH(fecha) = ?;
      `,
      [year, month]
    );

    const row = rows[0] || {
      totalOnline: 0,
      totalConsultorio: 0,
      totalEsperado: 0,
    };

    return res.json({
      ok: true,
      totalOnline: Number(row.totalOnline) || 0,
      totalConsultorio: Number(row.totalConsultorio) || 0,
      totalEsperado: Number(row.totalEsperado) || 0,
    });
  } catch (err) {
    console.error("Error GET /ingresos/totales:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al calcular ingresos" });
  }
});

module.exports = router;
