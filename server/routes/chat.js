const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { enviarPushAUsuario } = require("../push");

const router = express.Router();
router.use(requireAuth);

// Resuelve quiénes son entrenador_id/cliente_id de la conversación según el rol de quien llama
async function resolverConversacion(usuarioId, clienteIdQuery) {
  const usuario = await pool.query("SELECT rol, entrenador_id FROM usuarios WHERE id = $1", [usuarioId]);
  const u = usuario.rows[0];
  if (!u) return null;

  if (u.rol === "entrenador") {
    if (!clienteIdQuery) return null;
    const esCliente = await pool.query("SELECT id FROM usuarios WHERE id = $1 AND entrenador_id = $2", [
      clienteIdQuery,
      usuarioId,
    ]);
    if (esCliente.rows.length === 0) return null;
    return { entrenadorId: usuarioId, clienteId: Number(clienteIdQuery) };
  }

  if (!u.entrenador_id) return null;
  return { entrenadorId: u.entrenador_id, clienteId: usuarioId };
}

router.get("/", async (req, res) => {
  const conv = await resolverConversacion(req.usuarioId, req.query.clienteId);
  if (!conv) return res.status(404).json({ error: "No hay conversación disponible" });

  const mensajes = await pool.query(
    "SELECT * FROM mensajes WHERE entrenador_id = $1 AND cliente_id = $2 ORDER BY creado_en ASC",
    [conv.entrenadorId, conv.clienteId]
  );

  // Marca como leídos los mensajes que no envió quien está consultando
  await pool.query(
    "UPDATE mensajes SET leido = TRUE WHERE entrenador_id = $1 AND cliente_id = $2 AND remitente_id != $3",
    [conv.entrenadorId, conv.clienteId, req.usuarioId]
  );

  res.json(mensajes.rows);
});

router.post("/", async (req, res) => {
  const { contenido, clienteId } = req.body;
  if (!contenido || !contenido.trim()) return res.status(400).json({ error: "Mensaje vacío" });

  const conv = await resolverConversacion(req.usuarioId, clienteId);
  if (!conv) return res.status(404).json({ error: "No hay conversación disponible" });

  const result = await pool.query(
    `INSERT INTO mensajes (entrenador_id, cliente_id, remitente_id, contenido)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [conv.entrenadorId, conv.clienteId, req.usuarioId, contenido.trim().slice(0, 2000)]
  );

  const destinatarioId = req.usuarioId === conv.entrenadorId ? conv.clienteId : conv.entrenadorId;
  enviarPushAUsuario(pool, destinatarioId, {
    titulo: "Nuevo mensaje en NEX-FIT",
    cuerpo: contenido.trim().slice(0, 120),
  }).catch(() => {});

  res.json(result.rows[0]);
});

// Para el entrenador: lista de clientes con último mensaje y no leídos, para la bandeja
router.get("/resumen", async (req, res) => {
  const rol = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.usuarioId]);
  if (rol.rows[0]?.rol !== "entrenador") return res.status(403).json({ error: "Solo para entrenadores" });

  const clientes = await pool.query("SELECT id, email FROM usuarios WHERE entrenador_id = $1", [req.usuarioId]);

  const resumen = await Promise.all(
    clientes.rows.map(async (c) => {
      const ultimo = await pool.query(
        "SELECT contenido, remitente_id, creado_en FROM mensajes WHERE entrenador_id = $1 AND cliente_id = $2 ORDER BY creado_en DESC LIMIT 1",
        [req.usuarioId, c.id]
      );
      const noLeidos = await pool.query(
        "SELECT COUNT(*) FROM mensajes WHERE entrenador_id = $1 AND cliente_id = $2 AND remitente_id = $2 AND leido = FALSE",
        [req.usuarioId, c.id]
      );
      return {
        clienteId: c.id,
        email: c.email,
        ultimoMensaje: ultimo.rows[0] || null,
        noLeidos: Number(noLeidos.rows[0].count),
      };
    })
  );

  res.json(resumen);
});

// Mensaje masivo del entrenador a todos sus clientes
router.post("/masivo", async (req, res) => {
  const { contenido } = req.body;
  if (!contenido || !contenido.trim()) return res.status(400).json({ error: "Mensaje vacío" });

  const rol = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.usuarioId]);
  if (rol.rows[0]?.rol !== "entrenador") return res.status(403).json({ error: "Solo para entrenadores" });

  const clientes = await pool.query("SELECT id FROM usuarios WHERE entrenador_id = $1", [req.usuarioId]);
  const texto = contenido.trim().slice(0, 2000);

  await Promise.all(
    clientes.rows.map((c) =>
      pool.query(
        `INSERT INTO mensajes (entrenador_id, cliente_id, remitente_id, contenido) VALUES ($1,$2,$1,$3)`,
        [req.usuarioId, c.id, texto]
      )
    )
  );

  clientes.rows.forEach((c) => {
    enviarPushAUsuario(pool, c.id, { titulo: "Mensaje de tu entrenador", cuerpo: texto.slice(0, 120) }).catch(() => {});
  });

  res.json({ ok: true, enviados: clientes.rows.length });
});

module.exports = router;
