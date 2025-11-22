// server/src/lib/firebaseAdmin.js
const admin = require("firebase-admin");

// (opcional) por si quieres asegurarte aquí también
require("dotenv").config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "❌ Faltan variables de entorno Firebase: revisa FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en el .env del servidor."
  );
}

const serviceAccount = {
  project_id: projectId,
  client_email: clientEmail,
  private_key: privateKey.replace(/\\n/g, "\n"),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
