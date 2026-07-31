import { getToken } from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function activarNotificacionesPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    const infoRes = await fetch("/api/push/vapid-public-key");
    const info = await infoRes.json();
    if (!info.configurado || !info.publicKey) return; // el servidor aún no tiene las llaves VAPID configuradas

    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") return;

    const registro = await navigator.serviceWorker.register("/sw.js");
    const existente = await registro.pushManager.getSubscription();
    const suscripcion =
      existente ||
      (await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(info.publicKey),
      }));

    await fetch("/api/push/suscribir", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ subscription: suscripcion }),
    });
  } catch {
    // si algo falla (permiso denegado, navegador sin soporte, etc.) simplemente no se activan las notificaciones
  }
}
