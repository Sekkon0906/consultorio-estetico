// server/src/services/users.js
const { pool } = require("../lib/db");

/**
 * Busca usuario por email.
 */
async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

/**
 * Crea usuario a partir de datos que vienen de Firebase.
 */
async function createUserFromFirebase({
  email,
  displayName,
  photoURL,
  genero = "Otro",
  edad = 0,
}) {
  // separar nombres / apellidos muy básico
  const [nombres, ...rest] = (displayName || "").split(" ");
  const apellidos = rest.join(" ");

  const [result] = await pool.query(
    `INSERT INTO usuarios 
     (nombres, apellidos, email, password, edad, genero, telefono,
      antecedentes, antecedentesDescripcion,
      alergias, alergiasDescripcion,
      medicamentos, medicamentosDescripcion,
      photo, rol)
     VALUES (?, ?, ?, ?, ?, ?, ?, '', '', '', '', '', '', ?, 'user')`,
    [
      nombres || "Paciente",
      apellidos || "",
      email,
      "__firebase__",          // marcador, no lo usas para login normal
      edad,
      genero,
      "",                      // telefono
      photoURL || null,
    ]
  );

  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE id = ?",
    [result.insertId]
  );
  return rows[0];
}

/**
 * Crea o devuelve usuario a partir del payload de Firebase.
 */
async function getOrCreateUserFromFirebase(firebaseUser) {
  const { email, name: displayName, picture: photoURL } = firebaseUser;

  if (!email) {
    throw new Error("El usuario de Firebase no trae email.");
  }

  let user = await findUserByEmail(email);
  if (user) return user;

  user = await createUserFromFirebase({
    email,
    displayName,
    photoURL,
  });

  return user;
}

module.exports = {
  findUserByEmail,
  createUserFromFirebase,
  getOrCreateUserFromFirebase,
};
