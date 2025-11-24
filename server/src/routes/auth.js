// server/src/routes/auth.js
const express = require("express");
const router = express.Router();
const admin = require("../lib/firebaseAdmin");
const { getOrCreateUserFromFirebase } = require("../services/users");
const { pool } = require("../lib/db");

// Correos que deben ser admin
const correosAdmin = [
  "medinapipe123@gmail.com",
  "admin@clinicavm.com",
  "soporte@clinicavm.com",
  "losanosantiago615@gmail.com",
];

/**
 * ===========================
 *  LOGIN / REGISTRO CON GOOGLE
 * ===========================
 * POST /auth/google
 */
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ ok: false, error: "Falta idToken" });
    }

    // 1) Verificar token con Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 2) Buscar o crear usuario en MySQL
    let user = await getOrCreateUserFromFirebase({
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    });

    // 3) Si su correo está en la lista de admins, asegurar rol = 'admin'
    if (user && correosAdmin.includes(user.email) && user.rol !== "admin") {
      await pool.query("UPDATE usuarios SET rol = 'admin' WHERE id = ?", [
        user.id,
      ]);
      user.rol = "admin";
    }

    // 4) Devolver usuario “normalizado” al front
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

/**
 * ===========================
 *  REGISTRO CON EMAIL + PASSWORD
 * ===========================
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      email,
      password,
      telefono,
      edad,
      genero, // viene ya como 'Masculino' | 'Femenino' | 'Otro' desde el front
      antecedentes,
      antecedentesDescripcion,
      alergias,
      alergiasDescripcion,
      medicamentos,
      medicamentosDescripcion,
    } = req.body;

    if (!nombres || !apellidos || !email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos obligatorios",
      });
    }

    // ¿Este correo será admin?
    const rol = correosAdmin.includes(email) ? "admin" : "user";

    // ⚠️ En producción deberías hashear el password (bcrypt)
    const hash = password;

    const [result] = await pool.query(
      `INSERT INTO usuarios
       (nombres, apellidos, email, password, edad, genero, telefono,
        antecedentes, antecedentesDescripcion,
        alergias, alergiasDescripcion,
        medicamentos, medicamentosDescripcion,
        rol)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nombres,
        apellidos,
        email,
        hash,
        edad ?? 0,
        genero ?? "Otro",
        telefono ?? null,
        antecedentes ?? null,
        antecedentesDescripcion ?? null,
        alergias ?? null,
        alergiasDescripcion ?? null,
        medicamentos ?? null,
        medicamentosDescripcion ?? null,
        rol,
      ]
    );

    const [rows] = await pool.query(
      "SELECT id, nombres, apellidos, email, telefono, rol, photo FROM usuarios WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error("Error POST /auth/register:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        ok: false,
        error: "Ya existe un usuario con ese correo",
      });
    }

    return res.status(500).json({
      ok: false,
      error: "Error al registrar usuario",
    });
  }
});

/**
 * ===========================
 *  LOGIN CON EMAIL + PASSWORD
 * ===========================
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Email y contraseña son obligatorios" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, error: "Credenciales inválidas" });
    }

    const user = rows[0];

    // ⚠️ Si usas bcrypt, aquí deberías comparar el hash
    if (user.password !== password) {
      return res
        .status(401)
        .json({ ok: false, error: "Credenciales inválidas" });
    }

    const safeUser = {
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      telefono: user.telefono,
      rol: user.rol,
      photo: user.photo,
    };

    return res.json({ ok: true, user: safeUser });
  } catch (err) {
    console.error("Error POST /auth/login:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Error al iniciar sesión" });
  }
});

module.exports = router;
