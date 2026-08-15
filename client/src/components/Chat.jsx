import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, MessageSquare, Megaphone, X } from "lucide-react";
import { obtenerConversacion, enviarMensajeChat, obtenerResumenChats, enviarMensajeMasivo } from "../api";
import { EmptyState } from "./Comunes";

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

export default function Chat({ usuario, onIrATab }) {
  const [conversaciones, setConversaciones] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [masivoAbierto, setMasivoAbierto] = useState(false);
  const [textoMasivo, setTextoMasivo] = useState("");
  const [enviandoMasivo, setEnviandoMasivo] = useState(false);

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

  async function enviarMasivo() {
    if (!textoMasivo.trim()) return;
    setEnviandoMasivo(true);
    try {
      await enviarMensajeMasivo(textoMasivo.trim());
      setTextoMasivo("");
      setMasivoAbierto(false);
      cargarResumen();
    } catch {
      alert("No se pudo enviar el mensaje masivo");
    } finally {
      setEnviandoMasivo(false);
    }
  }

  if (!esEntrenador && !usuario?.entrenador_id) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Aún no tienes un entrenador vinculado"
        description="Ingresa el código de tu entrenador desde tu perfil y vas a poder chatear con él aquí."
        actionLabel={onIrATab ? "Ir a mi perfil" : undefined}
        onAction={onIrATab ? () => onIrATab("perfil") : undefined}
      />
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
      <button
        onClick={() => setMasivoAbierto(!masivoAbierto)}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-[var(--accent)] border border-[var(--accent-40)] rounded-lg py-2"
      >
        {masivoAbierto ? <X size={13} /> : <Megaphone size={13} />}
        {masivoAbierto ? "Cancelar" : "Enviar mensaje a todos mis clientes"}
      </button>

      {masivoAbierto && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5 space-y-2">
          <textarea
            value={textoMasivo}
            onChange={(e) => setTextoMasivo(e.target.value)}
            placeholder="Ej: Recuerden hidratarse bien esta semana 💧"
            rows={3}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] resize-none"
          />
          <button
            onClick={enviarMasivo}
            disabled={enviandoMasivo || !textoMasivo.trim()}
            className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] disabled:opacity-40 text-[var(--btn-text)] text-sm font-semibold rounded-lg py-2"
          >
            {enviandoMasivo ? "Enviando…" : "Enviar a todos"}
          </button>
        </div>
      )}

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
