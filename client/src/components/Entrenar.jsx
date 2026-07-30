import { useState } from "react";
import { Home, Building2, ChevronRight, Check, Clock, SlidersHorizontal, TrendingUp, PlayCircle } from "lucide-react";
import { EJERCICIOS, GRUPOS, TODO_EQUIPO, TIEMPOS_DISPONIBLES, ESTILOS_ENTRENAMIENTO, PRIORIDAD_PATRON, CALENTAMIENTO, DIAS_SEMANA, NOMBRE_DIA_GRUPO, armarPlanSemanal, hoy } from "../data";
import { Chip } from "./Comunes";

const INCREMENTOS = {
  sentadilla: 2.5,
  bisagra_cadera: 2.5,
  press_horizontal: 2.5,
  press_vertical: 2,
  remo_horizontal: 2,
  jalon_vertical: 2.5,
  zancada: 1,
  fondos: 1,
  gluteo_aislado: 1.5,
  aislamiento_biceps: 1,
  aislamiento_triceps: 1,
  aislamiento_hombro: 1,
  aislamiento_cuadriceps: 1.5,
  aislamiento_isquios: 1.5,
  aislamiento_pecho: 1,
  antebrazo: 0.5,
  pantorrilla: 2,
  core_isometrico: 0,
  core_flexion: 0,
  core_flexion_avanzada: 0,
  core_piernas: 0,
  core_rotacion: 0,
  cardio_constante: 0,
  hiit_funcional: 0,
};

// Elige el mejor ejercicio disponible para un patrón, según preferencia explícita del usuario
// o, si no hay preferencia, según el lugar: en gimnasio se prioriza máquina/cable, en casa libre/funcional.
function elegirEjercicio(opciones, estiloUsuario, lugar) {
  if (estiloUsuario && estiloUsuario !== "mixto") {
    const match = opciones.find((o) => o.estilo === estiloUsuario);
    if (match) return match;
  }
  const orden = lugar === "gimnasio" ? ["maquina", "libre", "funcional"] : ["libre", "funcional", "maquina"];
  for (const est of orden) {
    const match = opciones.find((o) => o.estilo === est);
    if (match) return match;
  }
  return opciones[0];
}

function generarRutina({ grupo, equipoDisponible, estilo, tiempo, lugar }) {
  const disponibles = EJERCICIOS.filter(
    (ej) => ej.grupo === grupo && ej.equipo.every((id) => equipoDisponible.includes(id))
  );

  const porPatron = {};
  disponibles.forEach((ej) => {
    if (!porPatron[ej.patron]) porPatron[ej.patron] = [];
    porPatron[ej.patron].push(ej);
  });

  let elegidos = Object.entries(porPatron).map(([patron, opciones]) => ({
    patron,
    prioridad: PRIORIDAD_PATRON[patron] ?? 2,
    ejercicio: elegirEjercicio(opciones, estilo, lugar),
  }));

  // Los patrones de menor número (compuestos) siempre van primero; con más tiempo entran más patrones
  elegidos.sort((a, b) => a.prioridad - b.prioridad);

  const maxEjercicios = tiempo <= 30 ? 4 : tiempo <= 45 ? 6 : 8;
  const seleccion = elegidos.slice(0, maxEjercicios);

  // Con 60+ minutos, dale una serie extra a los movimientos compuestos principales
  const rutina = seleccion.map(({ ejercicio, prioridad }) => {
    if (tiempo >= 60 && prioridad === 1 && ejercicio.series) {
      return { ...ejercicio, series: ejercicio.series + 1 };
    }
    return ejercicio;
  });

  // Si el día no es de abdomen, cerramos con 2 ejercicios de core (no cuentan contra el máximo de arriba)
  if (grupo !== "abdomen") {
    const absDisponibles = EJERCICIOS.filter(
      (ej) => ej.grupo === "abdomen" && ej.equipo.every((id) => equipoDisponible.includes(id))
    );
    const absPorPatron = {};
    absDisponibles.forEach((ej) => {
      if (!absPorPatron[ej.patron]) absPorPatron[ej.patron] = [];
      absPorPatron[ej.patron].push(ej);
    });
    const absElegidos = Object.values(absPorPatron)
      .map((opciones) => elegirEjercicio(opciones, estilo, lugar))
      .slice(0, 2);
    return [...rutina, ...absElegidos];
  }

  return rutina;
}

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
    if (ej && ej.peso) registros.push({ peso: ej.peso, repsLogradas: ej.repsLogradas ?? null });
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
    pesoSugerido = redondear(ultimo.peso + incremento);
    referencia = `Última vez: ${ultimo.peso}kg (x2) → Sugerido: ${pesoSugerido}kg 💪`;
  }

  return { peso: pesoSugerido, referencia };
}

function urlVideoEjercicio(nombre) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(nombre + " técnica ejecución")}`;
}

export default function Entrenar({ perfil, entrenamientos, onGuardarSesion }) {
  const [lugar, setLugar] = useState("casa");
  const [tiempo, setTiempo] = useState(45);
  const [estilo, setEstilo] = useState("mixto");
  const [grupo, setGrupo] = useState(null);
  const [rutina, setRutina] = useState(null);
  const [registro, setRegistro] = useState({});

  const equipoDisponible = lugar === "gimnasio" ? TODO_EQUIPO : perfil.equipo || [];

  const planSemanal = armarPlanSemanal(perfil.dias_entreno || 3);
  const diaSemanaHoy = new Date().getDay();
  const grupoSugeridoHoy = planSemanal[diaSemanaHoy];
  const nombreDiaHoy = DIAS_SEMANA[diaSemanaHoy];

  function generar(g) {
    setGrupo(g);
    const elegidos = generarRutina({ grupo: g, equipoDisponible, estilo, tiempo, lugar });
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
          onClick={() => { setLugar("casa"); setRutina(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium ${
            lugar === "casa" ? "bg-[#C8FF3D] border-[#C8FF3D] text-[#0D1210]" : "border-[#262E2B] text-[#8B948F]"
          }`}
        >
          <Home size={16} /> Casa
        </button>
        <button
          onClick={() => { setLugar("gimnasio"); setRutina(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium ${
            lugar === "gimnasio" ? "bg-[#C8FF3D] border-[#C8FF3D] text-[#0D1210]" : "border-[#262E2B] text-[#8B948F]"
          }`}
        >
          <Building2 size={16} /> Gimnasio
        </button>
      </div>
      <p className="text-[11px] text-[#5F6864] -mt-3">
        {lugar === "casa"
          ? "Prioriza pesas libres y peso corporal con tu equipo registrado."
          : "Prioriza máquinas y cable, asumiendo que tienes acceso a todo."}
      </p>

      {!rutina && (
        <>
          <div>
            <p className="text-xs text-[#8B948F] mb-2 flex items-center gap-1.5">
              <Clock size={12} /> ¿Cuánto tiempo tienes hoy?
            </p>
            <div className="flex gap-2">
              {TIEMPOS_DISPONIBLES.map((t) => (
                <Chip key={t.id} active={tiempo === t.id} onClick={() => setTiempo(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-[#5F6864] mt-1.5">
              {tiempo <= 30 && "Solo movimientos compuestos principales — rutina corta y eficiente."}
              {tiempo === 45 && "Compuestos + accesorios — rutina balanceada."}
              {tiempo >= 60 && "Rutina completa: compuestos con una serie extra, accesorios y aislamiento."}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8B948F] mb-2 flex items-center gap-1.5">
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
            {grupoSugeridoHoy && (
              <button
                onClick={() => generar(grupoSugeridoHoy)}
                className="w-full bg-[#171D1B] border-2 border-[#C8FF3D] rounded-xl px-4 py-4 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#5F6864]">Hoy es {nombreDiaHoy} · según tu plan</p>
                  <p className="font-semibold text-white text-base mt-0.5">{NOMBRE_DIA_GRUPO[grupoSugeridoHoy]}</p>
                </div>
                <ChevronRight size={18} color="#F5F7F6" />
              </button>
            )}
            {!grupoSugeridoHoy && (
              <div className="w-full bg-[#171D1B] border border-[#262E2B] rounded-xl px-4 py-3">
                <p className="text-sm text-[#8B948F]">Hoy {nombreDiaHoy.toLowerCase()} te tocaría descansar según tu plan. Puedes entrenar igual eligiendo un grupo abajo.</p>
              </div>
            )}
            <p className="text-xs text-[#8B948F] pt-1">O elige otro grupo manualmente:</p>
            {GRUPOS.map((g) => (
              <button
                key={g.id}
                onClick={() => generar(g.id)}
                className="w-full bg-[#171D1B] border border-[#262E2B] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-semibold text-sm">{g.label}</p>
                  <p className="text-xs text-[#8B948F]">{g.sub}</p>
                </div>
                <ChevronRight size={18} color="#5F6864" />
              </button>
            ))}
          </div>
        </>
      )}

      {rutina && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#C8FF3D]">
              {NOMBRE_DIA_GRUPO[grupo] || GRUPOS.find((g) => g.id === grupo)?.label} · {lugar === "casa" ? "Casa" : "Gimnasio"} · {tiempo} min
            </p>
            <button onClick={() => { setRutina(null); setGrupo(null); }} className="text-xs text-[#8B948F]">
              Cambiar
            </button>
          </div>

          {rutina.length === 0 && (
            <p className="text-sm text-[#8B948F] bg-[#171D1B] rounded-xl p-4">
              No tienes equipo suficiente para este grupo todavía. Prueba otro grupo o revisa tu equipo en Perfil.
            </p>
          )}

          {rutina.length > 0 && CALENTAMIENTO[grupo] && (
            <div className="bg-[#171D1B] border border-[#262E2B] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3.5">
              <p className="text-xs font-semibold text-[#C8FF3D] mb-1.5">🔥 Calentamiento (5 min)</p>
              <ul className="space-y-1">
                {CALENTAMIENTO[grupo].map((paso, i) => (
                  <li key={i} className="text-xs text-[#8B948F]">
                    · {paso}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rutina.map((ej) => (
            <div key={ej.nombre} className="bg-[#171D1B] border border-[#262E2B] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3.5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{ej.nombre}</p>
                  <p className="text-xs text-[#8B948F]">
                    {ej.series} series × {ej.reps}
                  </p>
                </div>
                <a
                  href={urlVideoEjercicio(ej.nombre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#8B948F] border border-[#262E2B] rounded-full px-2 py-1 shrink-0"
                >
                  <PlayCircle size={12} /> Ver técnica
                </a>
              </div>
              {registro[ej.nombre]?.referencia && (
                <p className="text-[11px] text-[#C8FF3D] mb-2 flex items-center gap-1">
                  <TrendingUp size={11} /> {registro[ej.nombre].referencia}
                </p>
              )}
              <div className="flex gap-2 items-center flex-wrap">
                <div>
                  <p className="text-[10px] text-[#5F6864] mb-1">Peso kg</p>
                  <input
                    type="number"
                    value={registro[ej.nombre]?.peso ?? ""}
                    onChange={(e) => setRegistro({ ...registro, [ej.nombre]: { ...registro[ej.nombre], peso: e.target.value } })}
                    className="w-20 bg-[#0D1210] border border-[#262E2B] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#C8FF3D]"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-[#5F6864] mb-1">Reps logradas</p>
                  <input
                    type="number"
                    placeholder="ej. 10"
                    value={registro[ej.nombre]?.repsLogradas ?? ""}
                    onChange={(e) => setRegistro({ ...registro, [ej.nombre]: { ...registro[ej.nombre], repsLogradas: e.target.value } })}
                    className="w-24 bg-[#0D1210] border border-[#262E2B] rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-[#C8FF3D]"
                  />
                </div>
              </div>
            </div>
          ))}

          {rutina.length > 0 && (
            <button
              onClick={guardarSesion}
              className="w-full bg-[#C8FF3D] hover:bg-[#9FCC2E] text-[#0D1210] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              <Check size={16} /> Guardar sesión de hoy
            </button>
          )}
        </div>
      )}
    </div>
  );
}
