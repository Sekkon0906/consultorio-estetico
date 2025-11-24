const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const procedimientosRoutes = require("./routes/procedimientos");
const testimoniosRoutes = require("./routes/testimonios");
const citasRoutes = require("./routes/citas");
const bloqueosHorasRoutes = require("./routes/bloqueosHoras");

const app = express();

// Dominios permitidos para CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://consultorio-estetico-bw657kmy0-santiagos-projects-29d8b051.vercel.app"
];

// Configuración de CORS
app.use(
  cors({
    origin: allowedOrigins,   // acepta cualquiera de esos orígenes
    credentials: true,        // necesario si usas cookies / sesiones
  })
);

app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/procedimientos", procedimientosRoutes);
app.use("/testimonios", testimoniosRoutes);
app.use("/citas", citasRoutes);
app.use("/bloqueos-horas", bloqueosHorasRoutes);

// Puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Servidor API escuchando en puerto", PORT);
});
