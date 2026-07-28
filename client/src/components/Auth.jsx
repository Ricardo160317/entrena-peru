import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, registrar, setToken } from "../api";

export default function Auth({ onAutenticado }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const emailLimpio = email.trim().toLowerCase();
      const data = modo === "login" ? await login(emailLimpio, password) : await registrar(emailLimpio, password);
      setToken(data.token);
      onAutenticado();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-[700px] bg-[#14181A] text-[#F2EFE9] font-sans flex flex-col max-w-md mx-auto px-6 py-10">
      <p className="text-xs tracking-[0.2em] uppercase text-[#D4A017]">Entrena Perú</p>
      <h1 className="text-2xl font-bold mt-1 mb-6">{modo === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h1>

      <form onSubmit={enviar} className="space-y-4">
        <div>
          <p className="text-xs text-[#9CA39C] mb-1.5">Email</p>
          <input
            type="email"
            required
            autoCapitalize="off"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1E2422] border border-[#3A4340] rounded-lg px-3 py-2.5 outline-none focus:border-[#D4A017]"
          />
        </div>
        <div>
          <p className="text-xs text-[#9CA39C] mb-1.5">Contraseña</p>
          <div className="relative">
            <input
              type={verPassword ? "text" : "password"}
              required
              minLength={6}
              autoCapitalize="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1E2422] border border-[#3A4340] rounded-lg px-3 py-2.5 pr-11 outline-none focus:border-[#D4A017]"
            />
            <button
              type="button"
              onClick={() => setVerPassword(!verPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E756F]"
              tabIndex={-1}
            >
              {verPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[#E07A7A]">{error}</p>}

        <button
          disabled={cargando}
          className="w-full bg-[#C1272D] disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold"
        >
          {cargando ? "Un momento…" : modo === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={() => {
          setModo(modo === "login" ? "registro" : "login");
          setError("");
        }}
        className="mt-5 text-xs text-[#9CA39C] underline text-center"
      >
        {modo === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
