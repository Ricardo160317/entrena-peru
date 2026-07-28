import { useState } from "react";
import { X } from "lucide-react";
import { EQUIPO_OPCIONES, NIVEL_ACTIVIDAD, OBJETIVOS } from "../data";
import { Campo, Chip } from "./Comunes";

export default function PerfilTab({ perfil, onGuardarPerfil, onCerrarSesion }) {
  const [form, setForm] = useState({
    ...perfil,
    grasa_pct: perfil.grasa_pct ?? "",
    musculo_pct: perfil.musculo_pct ?? "",
    agua_pct: perfil.agua_pct ?? "",
    visceral: perfil.visceral ?? "",
  });

  const toggleEquipo = (id) =>
    setForm((f) => ({
      ...f,
      equipo: f.equipo.includes(id) ? f.equipo.filter((e) => e !== id) : [...f.equipo, id],
    }));

  function guardar() {
    onGuardarPerfil({
      ...form,
      peso: Number(form.peso),
      altura: Number(form.altura),
      edad: Number(form.edad),
      grasa_pct: form.grasa_pct === "" ? null : Number(form.grasa_pct),
      musculo_pct: form.musculo_pct === "" ? null : Number(form.musculo_pct),
      agua_pct: form.agua_pct === "" ? null : Number(form.agua_pct),
      visceral: form.visceral === "" ? null : Number(form.visceral),
    });
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

      <button onClick={guardar} className="w-full bg-[#C1272D] text-white rounded-xl py-3 text-sm font-semibold">
        Guardar cambios
      </button>

      <div className="pt-4 border-t border-[#2A312E] flex items-center justify-between">
        <button onClick={onCerrarSesion} className="text-xs text-[#9CA39C] underline flex items-center gap-1">
          <X size={12} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function MiniCampo({ label, value, onChange }) {
  return (
    <div>
      <p className="text-[10px] text-[#9CA39C] mb-1">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1E2422] border border-[#3A4340] rounded-lg px-2 py-2 text-sm text-center outline-none focus:border-[#D4A017]"
      />
    </div>
  );
}
