import { useEffect, useState } from "react";
import { Plus, Trash2, Flame, X } from "lucide-react";
import { obtenerHabitos, crearHabito, borrarHabito, alternarHabito } from "../api";
import { hoy, fechaLegible } from "../data";

const EMOJIS_SUGERIDOS = ["💧", "📖", "🧘", "🥗", "🚶", "😴", "☀️", "✍️"];

function calcularRacha(fechasMarcadas) {
  const set = new Set(fechasMarcadas.map((f) => String(f).slice(0, 10)));
  let racha = 0;
  let cursor = new Date();
  while (true) {
    const clave = cursor.toISOString().slice(0, 10);
    if (set.has(clave)) {
      racha++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return racha;
}

export default function Habitos() {
  const [habitos, setHabitos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [emojiNuevo, setEmojiNuevo] = useState("✅");
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerHabitos();
      setHabitos(data.habitos);
      setRegistros(data.registros);
    } finally {
      setCargando(false);
    }
  }

  async function agregar() {
    if (!nombreNuevo.trim()) return;
    await crearHabito(nombreNuevo.trim(), emojiNuevo);
    setNombreNuevo("");
    setEmojiNuevo("✅");
    setMostrarForm(false);
    cargar();
  }

  async function eliminar(id) {
    await borrarHabito(id);
    cargar();
  }

  async function marcarHoy(id) {
    await alternarHabito(id, hoy());
    cargar();
  }

  const registrosPorHabito = (id) => registros.filter((r) => r.habito_id === id).map((r) => r.fecha);
  const marcadoHoy = (id) => registrosPorHabito(id).some((f) => String(f).slice(0, 10) === hoy());

  if (cargando) {
    return <p className="text-sm text-[#8B948F]">Cargando tus hábitos…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8B948F]">{fechaLegible(hoy())}</p>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="text-xs text-[#C8FF3D] flex items-center gap-1 border border-[#262E2B] rounded-full px-2.5 py-1"
        >
          {mostrarForm ? <X size={12} /> : <Plus size={12} />} {mostrarForm ? "Cerrar" : "Nuevo hábito"}
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-[#171D1B] border border-[#262E2B] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {EMOJIS_SUGERIDOS.map((e) => (
              <button
                key={e}
                onClick={() => setEmojiNuevo(e)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg ${
                  emojiNuevo === e ? "border-[#C8FF3D]" : "border-[#262E2B]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            placeholder="Ej: Tomar 2L de agua"
            className="w-full bg-[#0D1210] border border-[#262E2B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C8FF3D]"
          />
          <button onClick={agregar} className="w-full bg-[#C8FF3D] hover:bg-[#9FCC2E] text-[#0D1210] rounded-lg py-2.5 text-sm font-semibold">
            Agregar hábito
          </button>
        </div>
      )}

      {habitos.length === 0 && !mostrarForm && (
        <p className="text-sm text-[#5F6864] bg-[#171D1B] rounded-xl p-4">
          Aún no tienes hábitos. Agrega el primero — ej. tomar agua, leer, dormir temprano.
        </p>
      )}

      <div className="space-y-2">
        {habitos.map((h) => {
          const racha = calcularRacha(registrosPorHabito(h.id));
          const hecho = marcadoHoy(h.id);
          return (
            <div
              key={h.id}
              className="bg-[#171D1B] border border-[#262E2B] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3.5 flex items-center gap-3"
            >
              <button
                onClick={() => marcarHoy(h.id)}
                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xl shrink-0 ${
                  hecho ? "border-[#C8FF3D] bg-[#C8FF3D]/20" : "border-[#262E2B]"
                }`}
              >
                {h.emoji}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{h.nombre}</p>
                {racha > 0 ? (
                  <p className="text-[11px] text-[#C8FF3D] flex items-center gap-1">
                    <Flame size={11} /> {racha} {racha === 1 ? "día seguido" : "días seguidos"}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#5F6864]">Aún sin racha</p>
                )}
              </div>
              <button onClick={() => eliminar(h.id)}>
                <Trash2 size={15} color="#5F6864" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
