require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { initSchema } = require("./db");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/perfil", require("./routes/perfil"));
app.use("/api/entrenamientos", require("./routes/entrenamientos"));
app.use("/api/nutricion", require("./routes/nutricion"));
app.use("/api/asesor", require("./routes/asesor"));
app.use("/api/habitos", require("./routes/habitos"));
app.use("/api/foto", require("./routes/foto"));
app.use("/api/entrenador", require("./routes/entrenador"));
app.use("/api/rutinas", require("./routes/rutinas"));
app.use("/api/informe", require("./routes/informe"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/push", require("./routes/push"));

app.get("/api/salud", (req, res) => res.json({ ok: true }));

// Sirve el frontend ya compilado (client/dist) en producción
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT || 3000;

initSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`NEX-FIT corriendo en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error("No se pudo inicializar la base de datos:", err);
    process.exit(1);
  });
