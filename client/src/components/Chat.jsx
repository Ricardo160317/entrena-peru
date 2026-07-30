import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
import { obtenerConversacion, enviarMensajeChat, obtenerResumenChats } from "../api";

function horaLegible(fecha) {
  return new Date(fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function Conversacion({ usuarioId, clienteId, nombreOtro, onVolver }) {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const finRef = useRef(null);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 5000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function cargar() {
    try {
      const data = await obtenerConversacion(clienteId);
      setMensajes(data);
    } catch {
      // silencioso: puede fallar si aún no hay conversación, no pasa nada
    } finally {
      setCargando(false);
    }
  }

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    const contenido = texto;
    setTexto("");
    await enviarMensajeChat(contenido, clienteId);
    cargar();
  }

  return (
    <div className="flex flex-col h-[560px]">
      {onVolver && (
        <button onClick={onVolver} className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-2">
          <ArrowLeft size={13} /> {nombreOtro}
        </button>
      )}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {cargando && <p className="text-xs text-[var(--muted)]">Cargando…</p>}
        {!cargando && mensajes.length === 0 && (
          <p className="text-sm text-[var(--muted)] bg-[var(--card)] rounded-xl p-4">
            Aún no hay mensajes. Escribe el primero.
          </p>
        )}
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              m.remitente_id === usuarioId
                ? "bg-[var(--btn)] text-[var(--btn-text)] ml-auto"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
            }`}
          >
            {m.contenido}
            <p
              className={`text-[9px] mt-1 ${
                m.remitente_id === usuarioId ? "text-[var(--btn-text)] opacity-70" : "text-[var(--muted2)]"
              }`}
            >
              {horaLegible(m.creado_en)}
            </p>
          </div>
        ))}
        <div ref={finRef} />
      </div>
      <form onSubmit={enviar} className="flex gap-2 pt-3 border-t border-[var(--border)] mt-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button className="bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] rounded-lg px-3.5 flex items-center justify-center">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export default function Chat({ usuario }) {
  const [conversaciones, setConversaciones] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const esEntrenador = usuario?.rol === "entrenador";

  useEffect(() => {
    if (esEntrenador) {
      cargarResumen();
      const intervalo = setInterval(cargarResumen, 8000);
      return () => clearInterval(intervalo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esEntrenador]);

  async function cargarResumen() {
    try {
      const data = await obtenerResumenChats();
      setConversaciones(data);
    } catch {
      setConversaciones([]);
    }
  }

  if (!esEntrenador && !usuario?.entrenador_id) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center">
        <MessageSquare size={22} color="var(--muted2)" className="mx-auto mb-2" />
        <p className="text-sm text-[var(--muted)]">
          Aún no tienes un entrenador vinculado. Cuando ingreses el código de un entrenador, podrás chatear con él aquí.
        </p>
      </div>
    );
  }

  if (!esEntrenador) {
    return <Conversacion usuarioId={usuario.id} clienteId={null} nombreOtro="Tu entrenador" />;
  }

  if (clienteSeleccionado) {
    return (
      <Conversacion
        usuarioId={usuario.id}
        clienteId={clienteSeleccionado.clienteId}
        nombreOtro={clienteSeleccionado.email}
        onVolver={() => setClienteSeleccionado(null)}
      />
    );
  }

  return (
    <div className="space-y-2">
      {conversaciones === null && <p className="text-sm text-[var(--muted)]">Cargando…</p>}
      {conversaciones && conversaciones.length === 0 && (
        <p className="text-sm text-[var(--muted)] bg-[var(--card)] rounded-xl p-4">
          Aún no tienes clientes para chatear.
        </p>
      )}
      {conversaciones &&
        conversaciones.map((c) => (
          <button
            key={c.clienteId}
            onClick={() => setClienteSeleccionado(c)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-3 flex items-center justify-between text-left"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{c.email}</p>
              <p className="text-[11px] text-[var(--muted)] truncate">
                {c.ultimoMensaje ? c.ultimoMensaje.contenido : "Sin mensajes aún"}
              </p>
            </div>
            {c.noLeidos > 0 && (
              <span className="shrink-0 bg-[var(--accent)] text-[var(--on-accent)] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {c.noLeidos}
              </span>
            )}
          </button>
        ))}
    </div>
  );
}
