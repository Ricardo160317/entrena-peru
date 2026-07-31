const TOKEN_KEY = "entrena_peru_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error de red");
  }
  return data;
}

export const registrar = (email, password, esEntrenador, codigoEntrenador, nombre) =>
  api("/auth/registro", { method: "POST", body: { email, password, esEntrenador, codigoEntrenador, nombre } });

export const actualizarNombre = (nombre) => api("/auth/nombre", { method: "PUT", body: { nombre } });

export const obtenerMe = () => api("/auth/me");
export const obtenerClientesEntrenador = () => api("/entrenador/clientes");

export const login = (email, password) =>
  api("/auth/login", { method: "POST", body: { email, password } });

export const obtenerPerfil = () => api("/perfil");
export const guardarPerfil = (perfil) => api("/perfil", { method: "PUT", body: perfil });
export const obtenerMedidas = () => api("/perfil/medidas");
export const registrarMedida = (datos) => api("/perfil/medidas", { method: "POST", body: datos });
export const borrarMedida = (id) => api(`/perfil/medidas/${id}`, { method: "DELETE" });

export const obtenerEntrenamientos = () => api("/entrenamientos");
export const crearEntrenamiento = (sesion) => api("/entrenamientos", { method: "POST", body: sesion });

export const obtenerNutricion = () => api("/nutricion");
export const guardarDiaNutricion = (fecha, comidas) =>
  api(`/nutricion/${fecha}`, { method: "PUT", body: { comidas } });

export const preguntarAsesor = (mensaje, historial) =>
  api("/asesor", { method: "POST", body: { mensaje, historial } });

export const obtenerHabitos = () => api("/habitos");
export const crearHabito = (nombre, emoji) => api("/habitos", { method: "POST", body: { nombre, emoji } });
export const borrarHabito = (id) => api(`/habitos/${id}`, { method: "DELETE" });
export const alternarHabito = (id, fecha) => api(`/habitos/${id}/toggle`, { method: "POST", body: { fecha } });

export const analizarFotoComida = (imagen) => api("/foto/comida", { method: "POST", body: { imagen } });
export const buscarMacrosPorTexto = (nombre, gramos) => api("/foto/texto", { method: "POST", body: { nombre, gramos } });

export const obtenerRutinasFavoritas = () => api("/rutinas/favoritas");
export const crearRutinaFavorita = (nombre, grupo, ejercicios) =>
  api("/rutinas/favoritas", { method: "POST", body: { nombre, grupo, ejercicios } });
export const borrarRutinaFavorita = (id) => api(`/rutinas/favoritas/${id}`, { method: "DELETE" });
export const asignarRutinaFavorita = (clienteId, rutinaFavoritaId) =>
  api("/rutinas/asignar", { method: "POST", body: { clienteId, rutinaFavoritaId } });
export const asignarRutinaIA = (clienteId, grupo) =>
  api("/rutinas/asignar-ia", { method: "POST", body: { clienteId, grupo } });
export const generarMiRutinaIA = (grupo) => api("/rutinas/mi-ia", { method: "POST", body: { grupo } });
export const obtenerMisRutinasAsignadas = () => api("/rutinas/mias");
export const borrarMiRutinaAsignada = (grupo) => api(`/rutinas/mias/${grupo}`, { method: "DELETE" });

export async function descargarInformePDF(clienteId) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = clienteId ? `/api/informe/pdf?clienteId=${clienteId}` : "/api/informe/pdf";
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("No se pudo generar el informe");
  const blob = await res.blob();
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = "informe-entrena-peru.pdf";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
}

export const obtenerConversacion = (clienteId) => api(`/chat${clienteId ? `?clienteId=${clienteId}` : ""}`);
export const enviarMensajeChat = (contenido, clienteId) => api("/chat", { method: "POST", body: { contenido, clienteId } });
export const obtenerResumenChats = () => api("/chat/resumen");
export const enviarMensajeMasivo = (contenido) => api("/chat/masivo", { method: "POST", body: { contenido } });
