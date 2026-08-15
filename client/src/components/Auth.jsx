import { useState } from "react";
import { Eye, EyeOff, Dumbbell, Sparkles, TrendingUp } from "lucide-react";
import { login, registrar, setToken } from "../api";

const PROPUESTA = [
  { icon: Dumbbell, texto: "Rutinas que se adaptan a tu tiempo, equipo y lesiones" },
  { icon: Sparkles, texto: "Asesor con IA para dudas de entrenamiento y nutrición" },
  { icon: TrendingUp, texto: "Progreso con fotos, medidas y gráficos de evolución" },
];

export default function Auth({ onAutenticado }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [esEntrenador, setEsEntrenador] = useState(false);
  const [codigoEntrenador, setCodigoEntrenador] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const emailLimpio = email.trim().toLowerCase();
      const data =
        modo === "login"
          ? await login(emailLimpio, password)
          : await registrar(emailLimpio, password, esEntrenador, codigoEntrenador, nombre);
      setToken(data.token);
      onAutenticado();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="relative min-h-[700px] bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col max-w-md mx-auto px-6 py-10 overflow-hidden">
      <div
        className="absolute -top-24 -right-20 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--accent-15)", border: "1px solid var(--accent-40)" }}
        >
          <Dumbbell size={22} color="var(--accent)" />
        </div>
        <p className="text-xl font-black tracking-wide text-[var(--accent)]">NEX-FIT</p>
        <h1 className="text-2xl font-bold mt-1">{modo === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h1>
        <p className="text-sm text-[var(--muted)] mt-1 mb-6">
          {modo === "login" ? "Tu progreso te está esperando." : "Rutinas, nutrición y seguimiento en una sola app."}
        </p>

        {modo === "registro" && (
          <div className="space-y-2.5 mb-6">
            {PROPUESTA.map(({ icon: Icon, texto }) => (
              <div key={texto} className="flex items-start gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--accent-15)" }}
                >
                  <Icon size={13} color="var(--accent)" />
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={enviar} className="relative space-y-4">
        {modo === "registro" && (
          <div>
            <p className="text-xs text-[var(--muted)] mb-1.5">Tu nombre</p>
            <input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="¿Cómo te llamas?"
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}
        <div>
          <p className="text-xs text-[var(--muted)] mb-1.5">Email</p>
          <input
            type="email"
            required
            autoCapitalize="off"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <p className="text-xs text-[var(--muted)] mb-1.5">Contraseña</p>
          <div className="relative">
            <input
              type={verPassword ? "text" : "password"}
              required
              minLength={6}
              autoCapitalize="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 pr-11 outline-none focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => setVerPassword(!verPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]"
              tabIndex={-1}
            >
              {verPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {modo === "registro" && (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEsEntrenador(!esEntrenador);
                  setCodigoEntrenador("");
                }}
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  esEntrenador ? "bg-[var(--btn)] border-[var(--btn)]" : "border-[var(--border)]"
                }`}
              >
                {esEntrenador && <span className="text-[var(--bg)] text-xs font-bold">✓</span>}
              </button>
              <p className="text-xs text-[var(--muted)]">Me registro como entrenador (para gestionar mis clientes)</p>
            </div>

            {!esEntrenador && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-1.5">Código de tu entrenador (si te lo compartieron)</p>
                <input
                  value={codigoEntrenador}
                  onChange={(e) => setCodigoEntrenador(e.target.value)}
                  placeholder="Ej. A1B2C3"
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 outline-none focus:border-[var(--accent)] uppercase"
                />
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-[var(--error)]">{error}</p>}

        <button
          disabled={cargando}
          className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] disabled:opacity-50 text-[var(--bg)] rounded-xl py-3 text-sm font-semibold"
        >
          {cargando ? "Un momento…" : modo === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={() => {
          setModo(modo === "login" ? "registro" : "login");
          setError("");
        }}
        className="mt-5 text-xs text-[var(--muted)] underline text-center"
      >
        {modo === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
