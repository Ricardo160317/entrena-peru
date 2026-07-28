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

export const registrar = (email, password) =>
  api("/auth/registro", { method: "POST", body: { email, password } });

export const login = (email, password) =>
  api("/auth/login", { method: "POST", body: { email, password } });

export const obtenerPerfil = () => api("/perfil");
export const guardarPerfil = (perfil) => api("/perfil", { method: "PUT", body: perfil });
export const obtenerMedidas = () => api("/perfil/medidas");

export const obtenerEntrenamientos = () => api("/entrenamientos");
export const crearEntrenamiento = (sesion) => api("/entrenamientos", { method: "POST", body: sesion });

export const obtenerNutricion = () => api("/nutricion");
export const guardarDiaNutricion = (fecha, comidas) =>
  api(`/nutricion/${fecha}`, { method: "PUT", body: { comidas } });

export const preguntarAsesor = (mensaje, historial) =>
  api("/asesor", { method: "POST", body: { mensaje, historial } });
