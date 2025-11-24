const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const procedimientosRoutes = require("./routes/procedimientos");
const testimoniosRoutes = require("./routes/testimonios");
const citasRoutes = require("./routes/citas");
const bloqueosHorasRoutes = require("./routes/bloqueosHoras");
const ingresosRoutes = require("./routes/ingresos");
const reportesRoutes = require("./routes/reportes");
const charlasRoutes = require("./routes/charlas");

const app = express();

// 🔹 Dominios permitidos (local + tus deploys de Vercel)
const allowedOrigins = [
  "http://localhost:3000",
 "https://consultorio-estetico.vercel.app", // el que se ve en tu captura
];

// 🔹 Configuración global de CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir herramientas sin origin (Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔹 Preflight específico para /auth/google (POST)
app.options("/auth/google", cors());

app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/procedimientos", procedimientosRoutes);
app.use("/testimonios", testimoniosRoutes);
app.use("/citas", citasRoutes);
app.use("/bloqueos-horas", bloqueosHorasRoutes);
app.use("/ingresos", ingresosRoutes);
app.use("/reportes", reportesRoutes);
app.use("/charlas", charlasRoutes);
// Puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Servidor API escuchando en puerto", PORT);
});
