const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const procedimientosRoutes = require("./routes/procedimientos");
const app = express();
app.use(cors({ origin: ["http://localhost:3000", "https://TU-APP.vercel.app"], credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/procedimientos", procedimientosRoutes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Servidor API escuchando en puerto", PORT);
});
