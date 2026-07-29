import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { preguntarAsesor } from "../api";

export default function Asesor() {
  const [mensajes, setMensajes] = useState([
    { role: "assistant", content: "Hola, soy tu asesor de entrenamiento y nutrición. Pregúntame lo que quieras — puedo ver tu perfil, tus comidas de hoy y tus últimos entrenamientos." },
  ]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim() || cargando) return;
    setError("");
    const nuevoMensaje = { role: "user", content: texto };
    const historial = [...mensajes, nuevoMensaje];
    setMensajes(historial);
    setTexto("");
    setCargando(true);
    try {
      const data = await preguntarAsesor(
        nuevoMensaje.content,
        historial.map((m) => ({ role: m.role, content: m.content }))
      );
      setMensajes([...historial, { role: "assistant", content: data.respuesta }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col h-[520px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-[#A32638] text-white ml-auto"
                : "bg-[#1A2028] border border-[#263140] text-[#F2EFE9]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {cargando && <div className="text-xs text-[#6B7684]">El asesor está escribiendo…</div>}
        {error && <div className="text-xs text-[#E2828C]">{error}</div>}
        <div ref={finRef} />
      </div>

      <form onSubmit={enviar} className="flex gap-2 pt-3 border-t border-[#263140] mt-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: ¿qué como después de entrenar pierna?"
          className="flex-1 bg-[#1A2028] border border-[#2F3A47] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
        />
        <button
          disabled={cargando}
          className="bg-[#A32638] disabled:opacity-50 text-white rounded-lg px-3.5 flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
