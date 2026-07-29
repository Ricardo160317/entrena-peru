import { useState } from "react";
import { Home, Building2, ChevronRight, Check } from "lucide-react";
import { EJERCICIOS, GRUPOS, TODO_EQUIPO, hoy } from "../data";

export default function Entrenar({ perfil, entrenamientos, onGuardarSesion }) {
  const [lugar, setLugar] = useState("casa");
  const [grupo, setGrupo] = useState(null);
  const [rutina, setRutina] = useState(null);
  const [registro, setRegistro] = useState({});

  const equipoDisponible = lugar === "gimnasio" ? TODO_EQUIPO : perfil.equipo || [];

  function ultimoPeso(nombreEj) {
    for (let i = entrenamientos.length - 1; i >= 0; i--) {
      const ej = entrenamientos[i].ejercicios.find((e) => e.nombre === nombreEj);
      if (ej && ej.peso) return ej;
    }
    return null;
  }

  function generar(g) {
    setGrupo(g);
    const disponibles = EJERCICIOS.filter(
      (ej) => ej.grupo === g && ej.equipo.every((id) => equipoDisponible.includes(id))
    );
    const elegidos = disponibles.slice(0, 6);
    setRutina(elegidos);
    const inicial = {};
    elegidos.forEach((ej) => {
      const u = ultimoPeso(ej.nombre);
      inicial[ej.nombre] = { peso: u ? u.peso : "", reps: ej.reps };
    });
    setRegistro(inicial);
  }

  function guardarSesion() {
    const ejerciciosGuardados = rutina
      .filter((ej) => registro[ej.nombre]?.peso)
      .map((ej) => ({ nombre: ej.nombre, peso: Number(registro[ej.nombre].peso), reps: registro[ej.nombre].reps }));
    if (ejerciciosGuardados.length === 0) return;
    onGuardarSesion({ fecha: hoy(), lugar, grupo, ejercicios: ejerciciosGuardados });
    setRutina(null);
    setGrupo(null);
    setRegistro({});
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setLugar("casa");
            setRutina(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium ${
            lugar === "casa" ? "bg-[#6B8F4E] border-[#6B8F4E] text-[#0F1318]" : "border-[#2F3A47] text-[#B9C0BB]"
          }`}
        >
          <Home size={16} /> Casa
        </button>
        <button
          onClick={() => {
            setLugar("gimnasio");
            setRutina(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium ${
            lugar === "gimnasio" ? "bg-[#6B8F4E] border-[#6B8F4E] text-[#0F1318]" : "border-[#2F3A47] text-[#B9C0BB]"
          }`}
        >
          <Building2 size={16} /> Gimnasio
        </button>
      </div>

      {!rutina && (
        <div className="space-y-2.5">
          <p className="text-xs text-[#8B96A3]">¿Qué grupo muscular toca hoy?</p>
          {GRUPOS.map((g) => (
            <button
              key={g.id}
              onClick={() => generar(g.id)}
              className="w-full bg-[#1A2028] border border-[#263140] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <p className="font-semibold text-sm">{g.label}</p>
                <p className="text-xs text-[#8B96A3]">{g.sub}</p>
              </div>
              <ChevronRight size={18} color="#6B7684" />
            </button>
          ))}
        </div>
      )}

      {rutina && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#C9A227]">
              {GRUPOS.find((g) => g.id === grupo)?.label} · {lugar === "casa" ? "Casa" : "Gimnasio"}
            </p>
            <button
              onClick={() => {
                setRutina(null);
                setGrupo(null);
              }}
              className="text-xs text-[#8B96A3]"
            >
              Cambiar
            </button>
          </div>

          {rutina.length === 0 && (
            <p className="text-sm text-[#8B96A3] bg-[#1A2028] rounded-xl p-4">
              No tienes equipo suficiente para este grupo todavía. Prueba otro grupo o revisa tu equipo en Perfil.
            </p>
          )}

          {rutina.map((ej) => (
            <div key={ej.nombre} className="bg-[#1A2028] border border-[#263140] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] p-3.5">
              <div className="mb-2">
                <p className="font-medium text-sm">{ej.nombre}</p>
                <p className="text-xs text-[#8B96A3]">
                  {ej.series} series × {ej.reps}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Peso kg"
                  value={registro[ej.nombre]?.peso ?? ""}
                  onChange={(e) =>
                    setRegistro({ ...registro, [ej.nombre]: { ...registro[ej.nombre], peso: e.target.value } })
                  }
                  className="w-24 bg-[#0F1318] border border-[#2F3A47] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#C9A227]"
                />
                <span className="text-xs text-[#6B7684]">kg de referencia para hoy</span>
              </div>
            </div>
          ))}

          {rutina.length > 0 && (
            <button
              onClick={guardarSesion}
              className="w-full bg-[#A32638] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              <Check size={16} /> Guardar sesión de hoy
            </button>
          )}
        </div>
      )}
    </div>
  );
}
