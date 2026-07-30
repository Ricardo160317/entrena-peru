import { useState } from "react";
import { X } from "lucide-react";
import { EQUIPO_OPCIONES, NIVEL_ACTIVIDAD, OBJETIVOS, DIAS_ENTRENO_OPCIONES, TEMAS_COLOR, LESIONES_OPCIONES } from "../data";
import { Campo, Chip } from "./Comunes";

export default function PerfilTab({ perfil, onGuardarPerfil, onCerrarSesion }) {
  const [form, setForm] = useState({
    ...perfil,
    grasa_pct: perfil.grasa_pct ?? "",
    musculo_pct: perfil.musculo_pct ?? "",
    agua_pct: perfil.agua_pct ?? "",
    visceral: perfil.visceral ?? "",
    tema: perfil.tema || "verde",
    lesiones: perfil.lesiones || [],
  });

  const [equipoPersonalizado, setEquipoPersonalizado] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | guardando | guardado

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

  const toggleLesion = (id) =>
    setForm((f) => ({
      ...f,
      lesiones: f.lesiones.includes(id) ? f.lesiones.filter((e) => e !== id) : [...f.lesiones, id],
    }));

  async function guardar() {
    setEstado("guardando");
    try {
      await onGuardarPerfil({
        ...form,
        peso: Number(form.peso),
        altura: Number(form.altura),
        edad: Number(form.edad),
        grasa_pct: form.grasa_pct === "" ? null : Number(form.grasa_pct),
        musculo_pct: form.musculo_pct === "" ? null : Number(form.musculo_pct),
        agua_pct: form.agua_pct === "" ? null : Number(form.agua_pct),
        visceral: form.visceral === "" ? null : Number(form.visceral),
      });
      setEstado("guardado");
      setTimeout(() => setEstado("idle"), 2000);
    } catch {
      setEstado("idle");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <MiniCampo label="Peso kg" value={form.peso} onChange={(v) => setForm({ ...form, peso: v })} />
        <MiniCampo label="Altura cm" value={form.altura} onChange={(v) => setForm({ ...form, altura: v })} />
        <MiniCampo label="Edad" value={form.edad} onChange={(v) => setForm({ ...form, edad: v })} />
      </div>

      <Campo label="Objetivo">
        <div className="flex gap-2 flex-wrap">
          {OBJETIVOS.map((o) => (
            <Chip key={o.id} active={form.objetivo === o.id} onClick={() => setForm({ ...form, objetivo: o.id })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Campo>

      <Campo label="Días a la semana que entrenas">
        <div className="flex gap-2 flex-wrap">
          {DIAS_ENTRENO_OPCIONES.map((d) => (
            <Chip key={d} active={Number(form.dias_entreno) === d} onClick={() => setForm({ ...form, dias_entreno: d })}>
              {d} {d === 1 ? "día" : "días"}
            </Chip>
          ))}
        </div>
      </Campo>

      <Campo label="Color de la app">
        <div className="flex gap-3 flex-wrap">
          {TEMAS_COLOR.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setForm({ ...form, tema: t.id });
                document.documentElement.dataset.theme = t.id;
              }}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: t.color,
                  border: t.borde ? "1px solid var(--border)" : "none",
                  boxShadow:
                    form.tema === t.id
                      ? `0 0 0 2px var(--card), 0 0 0 4px ${t.borde ? "var(--muted)" : t.color}`
                      : "none",
                }}
              >
                {form.tema === t.id && <span className="text-[13px] font-bold" style={{ color: "#0D1210" }}>✓</span>}
              </span>
              <span className="text-[10px] text-[var(--muted)]">{t.label}</span>
            </button>
          ))}
        </div>
      </Campo>

      <Campo label="Nivel de actividad">
        <div className="flex flex-col gap-2">
          {NIVEL_ACTIVIDAD.map((n) => (
            <Chip key={n.id} active={form.nivel === n.id} onClick={() => setForm({ ...form, nivel: n.id })}>
              {n.label}
            </Chip>
          ))}
        </div>
      </Campo>

      <Campo label="Tu equipo en casa">
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
        <div className="flex gap-2 mt-2">
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
      </Campo>

      <Campo label="Lesiones o molestias (evitamos ejercicios de riesgo para esa zona)">
        <div className="flex flex-wrap gap-2">
          {LESIONES_OPCIONES.map((l) => (
            <Chip key={l.id} active={form.lesiones.includes(l.id)} onClick={() => toggleLesion(l.id)}>
              {l.label}
            </Chip>
          ))}
        </div>
      </Campo>

      <Campo label="Datos de tu balanza (opcional, se guardan también como historial)">
        <div className="grid grid-cols-4 gap-2">
          <MiniCampo label="Grasa %" value={form.grasa_pct} onChange={(v) => setForm({ ...form, grasa_pct: v })} />
          <MiniCampo label="Músculo %" value={form.musculo_pct} onChange={(v) => setForm({ ...form, musculo_pct: v })} />
          <MiniCampo label="Agua %" value={form.agua_pct} onChange={(v) => setForm({ ...form, agua_pct: v })} />
          <MiniCampo label="Visceral" value={form.visceral} onChange={(v) => setForm({ ...form, visceral: v })} />
        </div>
      </Campo>

      <button
        onClick={guardar}
        disabled={estado !== "idle"}
        className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
          estado === "idle"
            ? "bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--bg)]"
            : estado === "guardando"
            ? "bg-[var(--border)] text-[var(--muted)]"
            : "bg-[var(--border)] text-[var(--accent)]"
        }`}
      >
        {estado === "idle" && "Guardar cambios"}
        {estado === "guardando" && "Guardando…"}
        {estado === "guardado" && "✓ Guardado"}
      </button>

      <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <button onClick={onCerrarSesion} className="text-xs text-[var(--muted)] underline flex items-center gap-1">
          <X size={12} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function MiniCampo({ label, value, onChange }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--muted)] mb-1">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-2 text-sm text-center outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}
