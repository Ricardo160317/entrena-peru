import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { EJERCICIOS, GRUPOS } from "../data";
import { obtenerRutinasFavoritas, crearRutinaFavorita, borrarRutinaFavorita } from "../api";

export default function RutinasFavoritas() {
  const [favoritas, setFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("empuje");
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  function cargar() {
    setCargando(true);
    obtenerRutinasFavoritas()
      .then(setFavoritas)
      .finally(() => setCargando(false));
  }

  const ejerciciosDelGrupo = EJERCICIOS.filter((ej) => ej.grupo === grupo);

  function toggleEjercicio(ej) {
    setSeleccionados((s) =>
      s.some((e) => e.nombre === ej.nombre)
        ? s.filter((e) => e.nombre !== ej.nombre)
        : [...s, { nombre: ej.nombre, series: ej.series, reps: ej.reps }]
    );
  }

  function actualizarCampo(nombreEj, campo, valor) {
    setSeleccionados((s) => s.map((e) => (e.nombre === nombreEj ? { ...e, [campo]: valor } : e)));
  }

  async function guardar() {
    if (!nombre || seleccionados.length === 0) return;
    const ejerciciosFinales = seleccionados.map((e) => ({
      nombre: e.nombre,
      series: Number(e.series) || 1,
      reps: String(e.reps || "10"),
    }));
    await crearRutinaFavorita(nombre, grupo, ejerciciosFinales);
    setNombre("");
    setSeleccionados([]);
    setCreando(false);
    cargar();
  }

  async function eliminar(id) {
    await borrarRutinaFavorita(id);
    cargar();
  }

  if (cargando) return <p className="text-sm text-[var(--muted)]">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--muted)]">Rutinas que arma tú, listas para asignar</p>
        <button
          onClick={() => setCreando(!creando)}
          className="text-xs text-[var(--accent)] flex items-center gap-1 border border-[var(--border)] rounded-full px-2.5 py-1"
        >
          {creando ? <X size={12} /> : <Plus size={12} />} {creando ? "Cerrar" : "Nueva rutina"}
        </button>
      </div>

      {creando && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la rutina (ej. Empuje - principiantes)"
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <div className="flex gap-2 flex-wrap">
            {GRUPOS.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGrupo(g.id);
                  setSeleccionados([]);
                }}
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  grupo === g.id ? "bg-[var(--btn)] border-[var(--btn)] text-[var(--btn-text)]" : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-[var(--muted)]">Toca un ejercicio para agregarlo, y ajusta sus series/reps abajo</p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {ejerciciosDelGrupo.map((ej) => (
              <button
                key={ej.nombre}
                onClick={() => toggleEjercicio(ej)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${
                  seleccionados.some((e) => e.nombre === ej.nombre)
                    ? "bg-[var(--accent-15)] border-[var(--accent)]"
                    : "border-[var(--border)]"
                }`}
              >
                <span>{ej.nombre}</span>
                <span className="text-[10px] text-[var(--muted)]">
                  {ej.series}x{ej.reps} (sugerido)
                </span>
              </button>
            ))}
          </div>

          {seleccionados.length > 0 && (
            <div className="space-y-2 border-t border-[var(--border)] pt-3">
              <p className="text-[11px] text-[var(--muted)]">Ajusta series y repeticiones</p>
              {seleccionados.map((e) => (
                <div key={e.nombre} className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2">
                  <p className="text-xs flex-1 truncate">{e.nombre}</p>
                  <input
                    type="number"
                    value={e.series}
                    onChange={(ev) => actualizarCampo(e.nombre, "series", ev.target.value)}
                    className="w-12 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-1 text-xs text-center outline-none focus:border-[var(--accent)]"
                    title="Series"
                  />
                  <span className="text-[10px] text-[var(--muted2)]">×</span>
                  <input
                    value={e.reps}
                    onChange={(ev) => actualizarCampo(e.nombre, "reps", ev.target.value)}
                    placeholder="reps (ej. 8-10)"
                    className="w-20 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-1 text-xs text-center outline-none focus:border-[var(--accent)]"
                    title="Repeticiones"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={guardar}
            disabled={!nombre || seleccionados.length === 0}
            className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] disabled:opacity-40 text-[var(--btn-text)] text-sm font-semibold rounded-lg py-2.5"
          >
            Guardar rutina ({seleccionados.length} ejercicios)
          </button>
        </div>
      )}

      {favoritas.length === 0 && !creando && (
        <p className="text-sm text-[var(--muted)] bg-[var(--card)] rounded-xl p-4">
          Aún no tienes rutinas favoritas. Crea la primera para poder asignarla a tus clientes.
        </p>
      )}

      <div className="space-y-2">
        {favoritas.map((r) => (
          <div key={r.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{r.nombre}</p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  {GRUPOS.find((g) => g.id === r.grupo)?.label} · {r.ejercicios.length} ejercicios
                </p>
              </div>
              <button onClick={() => eliminar(r.id)}>
                <Trash2 size={14} color="var(--muted2)" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
