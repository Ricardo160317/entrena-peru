import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { EQUIPO_OPCIONES, NIVEL_ACTIVIDAD, OBJETIVOS } from "../data";
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
    });
  }

  return (
    <div className="min-h-[700px] bg-[#FFFFFF] text-[#111827] font-sans flex flex-col max-w-md mx-auto px-6 py-8">
      <p className="text-xs tracking-[0.2em] uppercase text-[#15803D]">Entrena Perú</p>
      <h1 className="text-2xl font-bold mt-1 mb-1">Armemos tu perfil</h1>
      <p className="text-sm text-[#6B7280] mb-6">Con esto calculamos tus rutinas y tus macros. Toma 1 minuto.</p>

      {errorGuardado && (
        <div className="mb-4 text-xs text-[#15803D] bg-[#FFFBEB] border border-[#F59E0B] rounded-lg p-3">
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
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] outline-none focus:border-[#15803D]"
              placeholder="70"
            />
          </Campo>
          <Campo label="Altura (cm)">
            <input
              type="number"
              value={form.altura}
              onChange={(e) => setForm({ ...form, altura: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] outline-none focus:border-[#15803D]"
              placeholder="170"
            />
          </Campo>
          <Campo label="Edad">
            <input
              type="number"
              value={form.edad}
              onChange={(e) => setForm({ ...form, edad: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] outline-none focus:border-[#15803D]"
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
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">
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
              className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#15803D]"
            />
            <button
              type="button"
              onClick={agregarEquipoPersonalizado}
              className="px-3 rounded-lg border border-[#E5E7EB] text-[#6B7280] text-sm"
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
            className="px-4 py-3 rounded-xl border border-[#E5E7EB] text-[#6B7280] text-sm font-medium"
          >
            Atrás
          </button>
        )}
        {paso < 2 && (
          <button
            disabled={!puedeAvanzar}
            onClick={() => setPaso(paso + 1)}
            className="flex-1 bg-[#111827] hover:bg-[#374151] disabled:opacity-40 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-1"
          >
            Continuar <ChevronRight size={16} />
          </button>
        )}
        {paso === 2 && (
          <button onClick={finalizar} className="flex-1 bg-[#111827] hover:bg-[#374151] text-white rounded-xl py-3 text-sm font-semibold">
            Empezar
          </button>
        )}
      </div>
    </div>
  );
}
