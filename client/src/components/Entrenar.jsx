import { useState } from "react";
import { Home, Building2, ChevronRight, Check, Clock, SlidersHorizontal, TrendingUp } from "lucide-react";
import { EJERCICIOS, GRUPOS, TODO_EQUIPO, TIEMPOS_DISPONIBLES, ESTILOS_ENTRENAMIENTO, hoy } from "../data";
import { Chip } from "./Comunes";

// Cuánto peso sumar cuando toca progresar, según el tipo de movimiento
const INCREMENTOS = {
  sentadilla: 2.5,
  bisagra_cadera: 2.5,
  press_horizontal: 2.5,
  press_vertical: 2,
  remo_horizontal: 2,
  jalon_vertical: 2.5,
  zancada: 1,
  aislamiento_biceps: 1,
  aislamiento_triceps: 1,
  aislamiento_hombro: 1,
  fondos: 1,
  core: 0,
  cardio_funcional: 0,
};

function generarRutina({ grupo, equipoDisponible, estilo, tiempo }) {
  const disponibles = EJERCICIOS.filter(
    (ej) => ej.grupo === grupo && ej.equipo.every((id) => equipoDisponible.includes(id))
  );

  const porPatron = {};
  disponibles.forEach((ej) => {
    if (!porPatron[ej.patron]) porPatron[ej.patron] = [];
    porPatron[ej.patron].push(ej);
  });

  const elegidos = Object.values(porPatron).map((opciones) => {
    if (estilo && estilo !== "mixto") {
      const match = opciones.find((o) => o.estilo === estilo);
      if (match) return match;
    }
    return opciones[0];
  });

  const maxEjercicios = tiempo <= 30 ? 3 : tiempo <= 45 ? 5 : 6;
  return elegidos.slice(0, maxEjercicios);
}

// Extrae el número más alto del rango de reps objetivo (ej. "8-10" -> 10). Devuelve null si no es un
// ejercicio medido en repeticiones (ej. "al fallo", "40s", "1 min").
function objetivoMaxReps(repsStr) {
  if (/fallo/i.test(repsStr) || /\bmin\b/i.test(repsStr) || /\d+s\b/.test(repsStr)) return null;
  const numeros = repsStr.match(/\d+/g);
  if (!numeros) return null;
  return Math.max(...numeros.map(Number));
}

function redondear(valor) {
  return Math.round(valor * 4) / 4;
}

function historialDe(nombreEj, entrenamientos) {
  const registros = [];
  entrenamientos.forEach((s) => {
    const ej = s.ejercicios.find((e) => e.nombre === nombreEj);
    if (ej && ej.peso) {
      registros.push({ peso: ej.peso, repsLogradas: ej.repsLogradas ?? null });
    }
  });
  return registros;
}

function sugerirProgresion(ej, entrenamientos) {
  const historial = historialDe(ej.nombre, entrenamientos);
  if (historial.length === 0) return { peso: "", referencia: null };

  const ultimo = historial[historial.length - 1];
  const penultimo = historial.length >= 2 ? historial[historial.length - 2] : null;
  const incremento = INCREMENTOS[ej.patron] ?? 1;
  const objetivo = objetivoMaxReps(ej.reps);

  let pesoSugerido = ultimo.peso;
  let referencia = `Última vez: ${ultimo.peso}kg${ultimo.repsLogradas ? ` × ${ultimo.repsLogradas} reps` : ""}`;

  if (objetivo != null && ultimo.repsLogradas != null) {
    const llegoTope = ultimo.repsLogradas >= objetivo;
    const penultimoTambienLlego =
      penultimo && penultimo.repsLogradas != null && penultimo.repsLogradas >= objetivo && penultimo.peso === ultimo.peso;

    if (llegoTope && penultimoTambienLlego && incremento > 0) {
      pesoSugerido = redondear(ultimo.peso + incremento);
      referencia = `Completaste ${objetivo} reps dos veces con ${ultimo.peso}kg → Sube a ${pesoSugerido}kg 💪`;
    } else if (llegoTope) {
      referencia = `¡Llegaste a ${objetivo} reps con ${ultimo.peso}kg! Repite una vez más y subes peso`;
    } else {
      referencia = `Última vez: ${ultimo.peso}kg × ${ultimo.repsLogradas} reps. Meta: ${objetivo} reps antes de subir peso`;
    }
  } else if (incremento > 0 && penultimo && penultimo.peso === ultimo.peso) {
    // Sin dato de reps logradas (ejercicios "al fallo" o por tiempo): regla simple de respaldo
    pesoSugerido = redondear(ultimo.peso + incremento);
    referencia = `Última vez: ${ultimo.peso}kg (x2) → Sugerido: ${pesoSugerido}kg 💪`;
  }

  return { peso: pesoSugerido, referencia };
}

export default function Entrenar({ perfil, entrenamientos, onGuardarSesion }) {
  const [lugar, setLugar] = useState("casa");
  const [tiempo, setTiempo] = useState(45);
  const [estilo, setEstilo] = useState("mixto");
  const [grupo, setGrupo] = useState(null);
  const [rutina, setRutina] = useState(null);
  const [registro, setRegistro] = useState({});

  const equipoDisponible = lugar === "gimnasio" ? TODO_EQUIPO : perfil.equipo || [];

  function generar(g) {
    setGrupo(g);
    const elegidos = generarRutina({ grupo: g, equipoDisponible, estilo, tiempo });
    setRutina(elegidos);
    const inicial = {};
    elegidos.forEach((ej) => {
      const { peso, referencia } = sugerirProgresion(ej, entrenamientos);
      inicial[ej.nombre] = { peso, repsLogradas: "", referencia };
    });
    setRegistro(inicial);
  }

  function guardarSesion() {
    const ejerciciosGuardados = rutina
      .filter((ej) => registro[ej.nombre]?.peso)
      .map((ej) => ({
        nombre: ej.nombre,
        peso: Number(registro[ej.nombre].peso),
        repsObjetivo: ej.reps,
        repsLogradas: registro[ej.nombre].repsLogradas ? Number(registro[ej.nombre].repsLogradas) : null,
      }));
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
            lugar === "casa" ? "bg-[#6B8F4E] border-[#6B8F4E] text-[#0F1318]" : "border-[#2F3A47] text-[#8B96A3]"
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
            lugar === "gimnasio" ? "bg-[#6B8F4E] border-[#6B8F4E] text-[#0F1318]" : "border-[#2F3A47] text-[#8B96A3]"
          }`}
        >
          <Building2 size={16} /> Gimnasio
        </button>
      </div>

      {!rutina && (
        <>
          <div>
            <p className="text-xs text-[#8B96A3] mb-2 flex items-center gap-1.5">
              <Clock size={12} /> ¿Cuánto tiempo tienes hoy?
            </p>
            <div className="flex gap-2">
              {TIEMPOS_DISPONIBLES.map((t) => (
                <Chip key={t.id} active={tiempo === t.id} onClick={() => setTiempo(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[#8B96A3] mb-2 flex items-center gap-1.5">
              <SlidersHorizontal size={12} /> ¿Qué prefieres hoy?
            </p>
            <div className="flex gap-2 flex-wrap">
              {ESTILOS_ENTRENAMIENTO.map((e) => (
                <Chip key={e.id} active={estilo === e.id} onClick={() => setEstilo(e.id)}>
                  {e.label}
                </Chip>
              ))}
            </div>
          </div>

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
        </>
      )}

      {rutina && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#C9A227]">
              {GRUPOS.find((g) => g.id === grupo)?.label} · {lugar === "casa" ? "Casa" : "Gimnasio"} · {tiempo} min
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
                {registro[ej.nombre]?.referencia && (
                  <p className="text-[11px] text-[#C9A227] mt-1 flex items-center gap-1">
                    <TrendingUp size={11} /> {registro[ej.nombre].referencia}
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <div>
                  <p className="text-[10px] text-[#6B7684] mb-1">Peso kg</p>
                  <input
                    type="number"
                    value={registro[ej.nombre]?.peso ?? ""}
                    onChange={(e) =>
                      setRegistro({ ...registro, [ej.nombre]: { ...registro[ej.nombre], peso: e.target.value } })
                    }
                    className="w-20 bg-[#0F1318] border border-[#2F3A47] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-[#6B7684] mb-1">Reps logradas</p>
                  <input
                    type="number"
                    placeholder="ej. 10"
                    value={registro[ej.nombre]?.repsLogradas ?? ""}
                    onChange={(e) =>
                      setRegistro({
                        ...registro,
                        [ej.nombre]: { ...registro[ej.nombre], repsLogradas: e.target.value },
                      })
                    }
                    className="w-24 bg-[#0F1318] border border-[#2F3A47] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#C9A227]"
                  />
                </div>
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
