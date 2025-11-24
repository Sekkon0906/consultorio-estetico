// server/src/routes/citas.js
const express = require("express");
const router = express.Router();
const { pool } = require("../lib/db");

/**
 * GET /citas?fecha=YYYY-MM-DD
 * - Si viene ?fecha, trae solo las de ese día
 * - Si no, trae todas (útil para el panel)
 */
router.get("/", async (req, res) => {
  try {
    const { fecha } = req.query;
    let rows;

    if (fecha) {
      [rows] = await pool.query(
        "SELECT * FROM citas WHERE fecha = ? ORDER BY hora",
        [fecha]
      );
    } else {
      [rows] = await pool.query(
        "SELECT * FROM citas ORDER BY fecha DESC, hora ASC"
      );
    }

    return res.json({ ok: true, citas: rows });
  } catch (err) {
    console.error("Error GET /citas:", err);
    return res.status(500).json({ ok: false, error: "Error al obtener citas" });
  }
});

/**
 * POST /citas
 * Crea una cita nueva
 */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      nombres,
      apellidos,
      telefono,
      correo,
      procedimiento,
      tipoCita,
      nota,
      fecha,
      hora,
      metodoPago,
      tipoPagoConsultorio,
      tipoPagoOnline,
      pagado,
      monto,
      montoPagado,
      montoRestante,
      creadaPor,
      estado,
      qrCita,
      motivoCancelacion,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO citas
       (userId, nombres, apellidos, telefono, correo, procedimiento, tipoCita,
        nota, fecha, hora, metodoPago, tipoPagoConsultorio, tipoPagoOnline,
        pagado, monto, montoPagado, montoRestante,
        creadaPor, estado, qrCita, motivoCancelacion)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId,
        nombres,
        apellidos,
        telefono,
        correo,
        procedimiento,
        tipoCita,
        nota ?? null,
        fecha,
        hora,
        metodoPago ?? null,
        tipoPagoConsultorio ?? null,
        tipoPagoOnline ?? null,
        pagado ? 1 : 0,
        monto ?? null,
        montoPagado ?? null,
        montoRestante ?? null,
        creadaPor ?? "usuario",
        estado ?? "pendiente",
        qrCita ?? null,
        motivoCancelacion ?? null,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM citas WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json({ ok: true, cita: rows[0] });
  } catch (err) {
    console.error("Error POST /citas:", err);
    return res.status(500).json({ ok: false, error: "Error al crear cita" });
  }
});

/**
 * PUT /citas/:id
 * Actualiza campos de la cita (partial update)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body || {};

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        ok: false,
        error: "No se recibieron campos para actualizar.",
      });
    }

    const sets = [];
    const values = [];

    Object.entries(fields).forEach(([key, value]) => {
      sets.push(`${key} = ?`);
      if (key === "pagado") {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    });

    values.push(id);

    const sql = `UPDATE citas SET ${sets.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);

    const [rows] = await pool.query("SELECT * FROM citas WHERE id = ?", [id]);

    return res.json({ ok: true, cita: rows[0] });
  } catch (err) {
    console.error("Error PUT /citas/:id:", err);
    return res.status(500).json({ ok: false, error: "Error al actualizar cita" });
  }
});

/**
 * DELETE /citas/:id
 * (Si prefieres cancelar en vez de borrar, cambia esto a un UPDATE estado='cancelada')
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM citas WHERE id = ?", [id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE /citas/:id:", err);
    return res.status(500).json({ ok: false, error: "Error al eliminar cita" });
  }
});

module.exports = router;
