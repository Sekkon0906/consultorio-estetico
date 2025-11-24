// server/src/routes/reportes.js
const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

/**
 * GET /reportes
 * Devuelve todos los reportes mensuales guardados.
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         mes,
         anio,
         fechaGeneracion,
         totalOnline,
         totalConsultorio,
         totalEsperado,
         archivoURL
       FROM reportes_mensuales
       ORDER BY fechaGeneracion DESC`
    );

    return res.json({ ok: true, reportes: rows });
  } catch (err) {
    console.error("Error GET /reportes:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al obtener reportes" });
  }
});

/**
 * POST /reportes
 * Crea o reemplaza un reporte para un mes/año.
 * Body esperado: { mes, anio, totalOnline, totalConsultorio, totalEsperado, archivoURL? }
 */
router.post("/", async (req, res) => {
  try {
    const {
      mes,
      anio,
      totalOnline = 0,
      totalConsultorio = 0,
      totalEsperado = 0,
      archivoURL = null,
    } = req.body;

    if (!mes || !anio) {
      return res.status(400).json({
        ok: false,
        error: "Campos 'mes' y 'anio' son obligatorios",
      });
    }

    // UPSERT: si ya existe ese mes/año, lo actualizamos
    const [result] = await pool.query(
      `
      INSERT INTO reportes_mensuales
        (mes, anio, totalOnline, totalConsultorio, totalEsperado, archivoURL)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        totalOnline = VALUES(totalOnline),
        totalConsultorio = VALUES(totalConsultorio),
        totalEsperado = VALUES(totalEsperado),
        archivoURL = VALUES(archivoURL),
        fechaGeneracion = CURRENT_TIMESTAMP
      `,
      [mes, anio, totalOnline, totalConsultorio, totalEsperado, archivoURL]
    );

    // recuperamos el registro final
    const [rows] = await pool.query(
      "SELECT * FROM reportes_mensuales WHERE mes = ? AND anio = ?",
      [mes, anio]
    );

    return res.status(201).json({ ok: true, reporte: rows[0] });
  } catch (err) {
    console.error("Error POST /reportes:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al guardar reporte" });
  }
});

module.exports = router;
