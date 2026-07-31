self.addEventListener("push", (event) => {
  let data = { titulo: "NEX-FIT", cuerpo: "Tienes una notificación nueva" };
  try {
    data = event.data.json();
  } catch {
    // si no viene JSON, se usa el mensaje por defecto
  }
  event.waitUntil(
    self.registration.showNotification(data.titulo || "NEX-FIT", {
      body: data.cuerpo || "",
      icon: "/icono.png",
      badge: "/icono.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if ("focus" in cliente) return cliente.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});
