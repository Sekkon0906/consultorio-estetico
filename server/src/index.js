const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const procedimientosRoutes = require("./routes/procedimientos");
const testimoniosRoutes = require("./routes/testimonios");
const citasRoutes = require("./routes/citas");
const bloqueosHorasRoutes = require("./routes/bloqueosHoras");
const app = express();
app.use(cors({ origin: ["http://localhost:3000", "https://consultorio-estetico-80emw06te-santiagos-projects-29d8b051.vercel.app/"], credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/procedimientos", procedimientosRoutes);
app.use("/testimonios", testimoniosRoutes);
app.use("/citas", citasRoutes);
app.use("/bloqueos-horas", bloqueosHorasRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Servidor API escuchando en puerto", PORT);
});
