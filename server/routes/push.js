const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { configurado } = require("../push");

const router = express.Router();

router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null, configurado });
});

router.use(requireAuth);

router.post("/suscribir", async (req, res) => {
  const { endpoint, keys } = req.body?.subscription || req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Suscripción inválida" });
  }
  await pool.query(
    `INSERT INTO push_subscripciones (usuario_id, endpoint, p256dh, auth)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (endpoint) DO UPDATE SET usuario_id = $1, p256dh = $3, auth = $4`,
    [req.usuarioId, endpoint, keys.p256dh, keys.auth]
  );
  res.json({ ok: true });
});

router.post("/desuscribir", async (req, res) => {
  const { endpoint } = req.body;
  if (endpoint) {
    await pool.query("DELETE FROM push_subscripciones WHERE endpoint = $1 AND usuario_id = $2", [endpoint, req.usuarioId]);
  }
  res.json({ ok: true });
});

module.exports = router;
