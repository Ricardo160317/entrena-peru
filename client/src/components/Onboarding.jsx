import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { EQUIPO_OPCIONES, NIVEL_ACTIVIDAD, OBJETIVOS, DIAS_ENTRENO_OPCIONES } from "../data";
import { Campo, Chip } from "./Comunes";

export default function Onboarding({ onGuardar, errorGuardado }) {
  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState({
    peso: "",
    altura: "",
    edad: "",
    sexo: "M",
    nivel: "moderado",
    objetivo: "mantener",
    diasEntreno: 3,
    equipo: [],
  });

  const [equipoPersonalizado, setEquipoPersonalizado] = useState("");

  const toggleEquipo = (id) =>
    setForm((f) => ({
      ...f,
      equipo: f.equipo.includes(id) ? f.equipo.filter((e) => e !== id) : [...f.equipo, id],
    }));

  function agregarEquipoPersonalizado() {
    const valor = equipoPersonalizado.trim();
    if (!valor || form.equipo.includes(valor)) return;
    setForm((f) => ({ ...f, equipo: [...f.equipo, valor] }));
    setEquipoPersonalizado("");
  }

  const puedeAvanzar = paso === 0 ? form.peso && form.altura && form.edad : true;

  function finalizar() {
    onGuardar({
      peso: Number(form.peso),
      altura: Number(form.altura),
      edad: Number(form.edad),
      sexo: form.sexo,
      nivel: form.nivel,
      objetivo: form.objetivo,
      equipo: form.equipo,
      dias_entreno: form.diasEntreno,
    });
  }

  return (
    <div className="min-h-[700px] bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col max-w-md mx-auto px-6 py-8">
      <p className="text-xs tracking-[0.2em] uppercase text-[var(--accent)]">Entrena Perú</p>
      <h1 className="text-2xl font-bold mt-1 mb-1">Armemos tu perfil</h1>
      <p className="text-sm text-[var(--muted)] mb-6">Con esto calculamos tus rutinas y tus macros. Toma 1 minuto.</p>

      {errorGuardado && (
        <div className="mb-4 text-xs text-[var(--accent)] bg-[var(--warning-bg)] border border-[var(--warning)] rounded-lg p-3">
          No se pudo guardar tu perfil. Intenta de nuevo en unos segundos.
        </div>
      )}

      {paso === 0 && (
        <div className="space-y-4">
          <Campo label="Peso (kg)">
            <input
              type="number"
              value={form.peso}
              onChange={(e) => setForm({ ...form, peso: e.target.value })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              placeholder="70"
            />
          </Campo>
          <Campo label="Altura (cm)">
            <input
              type="number"
              value={form.altura}
              onChange={(e) => setForm({ ...form, altura: e.target.value })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              placeholder="170"
            />
          </Campo>
          <Campo label="Edad">
            <input
              type="number"
              value={form.edad}
              onChange={(e) => setForm({ ...form, edad: e.target.value })}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              placeholder="28"
            />
          </Campo>
          <Campo label="Sexo (para el cálculo metabólico)">
            <div className="flex gap-2">
              <Chip active={form.sexo === "M"} onClick={() => setForm({ ...form, sexo: "M" })}>
                Hombre
              </Chip>
              <Chip active={form.sexo === "F"} onClick={() => setForm({ ...form, sexo: "F" })}>
                Mujer
              </Chip>
            </div>
          </Campo>
        </div>
      )}

      {paso === 1 && (
        <div className="space-y-4">
          <Campo label="Nivel de actividad">
            <div className="flex flex-col gap-2">
              {NIVEL_ACTIVIDAD.map((n) => (
                <Chip key={n.id} active={form.nivel === n.id} onClick={() => setForm({ ...form, nivel: n.id })}>
                  {n.label}
                </Chip>
              ))}
            </div>
          </Campo>
          <Campo label="Objetivo">
            <div className="flex gap-2 flex-wrap">
              {OBJETIVOS.map((o) => (
                <Chip key={o.id} active={form.objetivo === o.id} onClick={() => setForm({ ...form, objetivo: o.id })}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </Campo>
          <Campo label="¿Cuántos días a la semana planeas entrenar?">
            <div className="flex gap-2 flex-wrap">
              {DIAS_ENTRENO_OPCIONES.map((d) => (
                <Chip key={d} active={form.diasEntreno === d} onClick={() => setForm({ ...form, diasEntreno: d })}>
                  {d} {d === 1 ? "día" : "días"}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-[var(--muted2)] mt-1.5">
              Con esto armamos un plan por día (ej. pecho/bíceps, pierna, espalda) en vez de que elijas cada vez.
            </p>
          </Campo>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">
            Marca el equipo que tienes en casa. En el gimnasio asumimos que tienes todo disponible.
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPO_OPCIONES.map((eq) => (
              <Chip key={eq.id} active={form.equipo.includes(eq.id)} onClick={() => toggleEquipo(eq.id)}>
                {eq.label}
              </Chip>
            ))}
            {form.equipo
              .filter((id) => !EQUIPO_OPCIONES.some((eq) => eq.id === id))
              .map((personalizado) => (
                <Chip key={personalizado} active onClick={() => toggleEquipo(personalizado)}>
                  {personalizado} ✕
                </Chip>
              ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              value={equipoPersonalizado}
              onChange={(e) => setEquipoPersonalizado(e.target.value)}
              placeholder="¿Tienes algo más? Escríbelo aquí"
              className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={agregarEquipoPersonalizado}
              className="px-3 rounded-lg border border-[var(--border)] text-[var(--muted)] text-sm"
            >
              Agregar
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {paso > 0 && (
          <button
            onClick={() => setPaso(paso - 1)}
            className="px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--muted)] text-sm font-medium"
          >
            Atrás
          </button>
        )}
        {paso < 2 && (
          <button
            disabled={!puedeAvanzar}
            onClick={() => setPaso(paso + 1)}
            className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--bg)] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1"
          >
            Continuar <ChevronRight size={16} />
          </button>
        )}
        {paso === 2 && (
          <button onClick={finalizar} className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg)] rounded-xl py-3 text-sm font-semibold">
            Empezar
          </button>
        )}
      </div>
    </div>
  );
}
