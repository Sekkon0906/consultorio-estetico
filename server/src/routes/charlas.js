// server/src/routes/charlas.js
const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

/**
 * GET /charlas
 * Obtiene todas las charlas
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, titulo, descripcion, detalle, imagen, fecha 
       FROM charlas ORDER BY fecha DESC`
    );
    res.json({ ok: true, charlas: rows });
  } catch (err) {
    console.error("Error GET /charlas:", err);
    res.status(500).json({ ok: false, error: "Error al obtener charlas" });
  }
});

/**
 * POST /charlas
 * Crea una charla
 */
router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion, detalle, imagen, fecha } = req.body;
    if (!titulo || !descripcion || !detalle || !imagen) {
      return res.status(400).json({ ok: false, error: "Campos obligatorios faltantes" });
    }

    const [result] = await pool.query(
      `INSERT INTO charlas (titulo, descripcion, detalle, imagen, fecha) 
       VALUES (?, ?, ?, ?, ?)`,
      [titulo, descripcion, detalle, imagen, fecha ?? null]
    );

    const [rows] = await pool.query("SELECT * FROM charlas WHERE id = ?", [result.insertId]);
    res.status(201).json({ ok: true, charla: rows[0] });
  } catch (err) {
    console.error("Error POST /charlas:", err);
    res.status(500).json({ ok: false, error: "Error al crear charla" });
  }
});

/**
 * PUT /charlas/:id
 * Actualiza una charla
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    if (Object.keys(datos).length === 0) {
      return res.status(400).json({ ok: false, error: "No hay datos para actualizar" });
    }

    const campos = [];
    const valores = [];

    Object.entries(datos).forEach(([key, value]) => {
      campos.push(`${key} = ?`);
      valores.push(value);
    });

    valores.push(id);

    await pool.query(`UPDATE charlas SET ${campos.join(", ")} WHERE id = ?`, valores);

    const [rows] = await pool.query("SELECT * FROM charlas WHERE id = ?", [id]);
    res.json({ ok: true, charla: rows[0] });
  } catch (err) {
    console.error("Error PUT /charlas:", err);
    res.status(500).json({ ok: false, error: "Error al actualizar charla" });
  }
});

/**
 * DELETE /charlas/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM charlas WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE /charlas:", err);
    res.status(500).json({ ok: false, error: "Error al eliminar charla" });
  }
});

module.exports = router;
