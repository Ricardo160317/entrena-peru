const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

router.post("/registro", async (req, res) => {
  const { email, password, codigoAcceso } = req.body;

  if (process.env.ACCESS_CODE && codigoAcceso !== process.env.ACCESS_CODE) {
    return res.status(403).json({ error: "Código de acceso inválido" });
  }
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email y contraseña (mínimo 6 caracteres) son requeridos" });
  }

  try {
    const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email.toLowerCase()]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO usuarios (email, password_hash) VALUES ($1, $2) RETURNING id",
      [email.toLowerCase(), hash]
    );
    const usuarioId = result.rows[0].id;
    const token = jwt.sign({ usuarioId }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la cuenta" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT id, password_hash FROM usuarios WHERE email = $1", [
      (email || "").toLowerCase(),
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    const usuario = result.rows[0];
    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) return res.status(401).json({ error: "Email o contraseña incorrectos" });
    const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

module.exports = router;
