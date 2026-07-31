const webpush = require("web-push");

const configurado = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

if (configurado) {
  webpush.setVapidDetails(
    process.env.VAPID_CONTACT_EMAIL || "mailto:soporte@nexfit.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function enviarPushAUsuario(pool, usuarioId, payload) {
  if (!configurado) return;
  const subs = await pool.query("SELECT * FROM push_subscripciones WHERE usuario_id = $1", [usuarioId]);
  await Promise.all(
    subs.rows.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        // Si la suscripción ya no es válida (usuario desinstaló, permiso revocado), la limpiamos
        if (err.statusCode === 404 || err.statusCode === 410) {
          await pool.query("DELETE FROM push_subscripciones WHERE id = $1", [s.id]);
        }
      }
    })
  );
}

module.exports = { enviarPushAUsuario, configurado };
