// server/src/routes/auth.js
const express = require("express");
const router = express.Router();
const admin = require("../lib/firebaseAdmin");
const { getOrCreateUserFromFirebase } = require("../services/users");

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ ok: false, error: "Falta idToken" });
    }

    // 1) Verificar token con Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 2) Buscar o crear usuario en MySQL
    const user = await getOrCreateUserFromFirebase({
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    });

    // 3) Devolver usuario “normalizado” al front
    return res.json({
      ok: true,
      user: {
        id: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        photo: user.photo,
      },
    });
  } catch (err) {
    console.error("Error /auth/google:", err);
    return res
      .status(401)
      .json({ ok: false, error: "Token inválido o expirado" });
  }
});

module.exports = router;
