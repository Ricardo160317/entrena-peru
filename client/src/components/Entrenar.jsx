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
            lugar === "casa" ? "bg-[#7A9B57] border-[#7A9B57] text-[#14181A]" : "border-[#3A4340] text-[#B9C0BB]"
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
            lugar === "gimnasio" ? "bg-[#7A9B57] border-[#7A9B57] text-[#14181A]" : "border-[#3A4340] text-[#B9C0BB]"
          }`}
        >
          <Building2 size={16} /> Gimnasio
        </button>
      </div>

      {!rutina && (
        <div className="space-y-2.5">
          <p className="text-xs text-[#9CA39C]">¿Qué grupo muscular toca hoy?</p>
          {GRUPOS.map((g) => (
            <button
              key={g.id}
              onClick={() => generar(g.id)}
              className="w-full bg-[#1E2422] border border-[#2A312E] rounded-xl px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <p className="font-semibold text-sm">{g.label}</p>
                <p className="text-xs text-[#9CA39C]">{g.sub}</p>
              </div>
              <ChevronRight size={18} color="#6E756F" />
            </button>
          ))}
        </div>
      )}

      {rutina && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#D4A017]">
              {GRUPOS.find((g) => g.id === grupo)?.label} · {lugar === "casa" ? "Casa" : "Gimnasio"}
            </p>
            <button
              onClick={() => {
                setRutina(null);
                setGrupo(null);
              }}
              className="text-xs text-[#9CA39C]"
            >
              Cambiar
            </button>
          </div>

          {rutina.length === 0 && (
            <p className="text-sm text-[#9CA39C] bg-[#1E2422] rounded-xl p-4">
              No tienes equipo suficiente para este grupo todavía. Prueba otro grupo o revisa tu equipo en Perfil.
            </p>
          )}

          {rutina.map((ej) => (
            <div key={ej.nombre} className="bg-[#1E2422] border border-[#2A312E] rounded-xl p-3.5">
              <div className="mb-2">
                <p className="font-medium text-sm">{ej.nombre}</p>
                <p className="text-xs text-[#9CA39C]">
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
                  className="w-24 bg-[#14181A] border border-[#3A4340] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#D4A017]"
                />
                <span className="text-xs text-[#6E756F]">kg de referencia para hoy</span>
              </div>
            </div>
          ))}

          {rutina.length > 0 && (
            <button
              onClick={guardarSesion}
              className="w-full bg-[#C1272D] text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              <Check size={16} /> Guardar sesión de hoy
            </button>
          )}
        </div>
      )}
    </div>
  );
}
