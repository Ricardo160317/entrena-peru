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
      s.some((e) => e.nombre === ej.nombre) ? s.filter((e) => e.nombre !== ej.nombre) : [...s, { nombre: ej.nombre, series: ej.series, reps: ej.reps }]
    );
  }

  async function guardar() {
    if (!nombre || seleccionados.length === 0) return;
    await crearRutinaFavorita(nombre, grupo, seleccionados);
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
                  grupo === g.id ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--on-accent)]" : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
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
                  {ej.series}x{ej.reps}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={guardar}
            disabled={!nombre || seleccionados.length === 0}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--on-accent)] text-sm font-semibold rounded-lg py-2.5"
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
