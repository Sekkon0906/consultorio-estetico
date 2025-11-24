// server/src/routes/testimonios.js
const express = require("express");
const router = express.Router();

const {
  getTestimonios,
  createTestimonio,
  updateTestimonio,
  deleteTestimonio,
} = require("../services/testimonios");

// GET /testimonios
router.get("/", async (req, res) => {
  try {
    const lista = await getTestimonios();
    return res.json({ ok: true, testimonios: lista });
  } catch (err) {
    console.error("Error GET /testimonios:", err);
    return res.status(500).json({ ok: false, error: "Error obteniendo testimonios" });
  }
});

// POST /testimonios
router.post("/", async (req, res) => {
  try {
    const nuevo = await createTestimonio(req.body);
    return res.status(201).json({ ok: true, testimonio: nuevo });
  } catch (err) {
    console.error("Error POST /testimonios:", err);
    return res.status(500).json({ ok: false, error: "Error creando testimonio" });
  }
});

// PUT /testimonios/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const actualizado = await updateTestimonio(id, req.body);
    return res.json({ ok: true, testimonio: actualizado });
  } catch (err) {
    console.error("Error PUT /testimonios/:id:", err);
    return res.status(500).json({ ok: false, error: "Error actualizando testimonio" });
  }
});

// DELETE /testimonios/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await deleteTestimonio(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error DELETE /testimonios/:id:", err);
    return res.status(500).json({ ok: false, error: "Error eliminando testimonio" });
  }
});

module.exports = router;
