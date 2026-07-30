import { useState, useEffect } from "react";
import { Home, Building2, ChevronRight, Check, Clock, SlidersHorizontal, TrendingUp, PlayCircle, Calendar, ChevronDown, ChevronUp, Plus, Sparkles, UserCheck } from "lucide-react";
import { EJERCICIOS, GRUPOS, TODO_EQUIPO, TIEMPOS_DISPONIBLES, ESTILOS_ENTRENAMIENTO, PRIORIDAD_PATRON, CALENTAMIENTO, DIAS_SEMANA, NOMBRE_DIA_GRUPO, armarPlanSemanal, CONSEJOS_DESCANSO, hoy } from "../data";
import { Chip } from "./Comunes";
import { obtenerMisRutinasAsignadas, generarMiRutinaIA } from "../api";

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

// Devuelve el "set representativo" de una sesión pasada para un ejercicio: la última serie registrada
// (funciona con el formato nuevo `series: [...]` y también con sesiones viejas que tenían peso/repsLogradas sueltos)
function setRepresentativo(ejercicioSesion) {
  if (Array.isArray(ejercicioSesion.series) && ejercicioSesion.series.length > 0) {
    const validas = ejercicioSesion.series.filter((s) => s.peso);
    if (validas.length === 0) return null;
    return validas[validas.length - 1];
  }
  if (ejercicioSesion.peso) {
    return { peso: ejercicioSesion.peso, reps: ejercicioSesion.repsLogradas ?? null };
  }
  return null;
}

function historialDe(nombreEj, entrenamientos) {
  const registros = [];
  entrenamientos.forEach((s) => {
    const ej = s.ejercicios.find((e) => e.nombre === nombreEj);
    if (!ej) return;
    const rep = setRepresentativo(ej);
    if (rep) registros.push({ peso: rep.peso, repsLogradas: rep.reps });
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
  const [verSemana, setVerSemana] = useState(false);
  const [rutinasAsignadas, setRutinasAsignadas] = useState([]);
  const [origenRutina, setOrigenRutina] = useState(null); // {origen, generado_en} de la rutina actual
  const [generandoIA, setGenerandoIA] = useState(false);

  useEffect(() => {
    obtenerMisRutinasAsignadas().then(setRutinasAsignadas).catch(() => {});
  }, []);

  function rutinaAsignadaDe(g) {
    return rutinasAsignadas.find((r) => r.grupo === g) || null;
  }

  const equipoDisponible = lugar === "gimnasio" ? TODO_EQUIPO : perfil.equipo || [];

  const planSemanal = armarPlanSemanal(perfil.dias_entreno || 3);
  const diaSemanaHoy = new Date().getDay();
  const grupoSugeridoHoy = planSemanal[diaSemanaHoy];
  const nombreDiaHoy = DIAS_SEMANA[diaSemanaHoy];
  const diaDelAño = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const consejoDescansoHoy = CONSEJOS_DESCANSO[diaDelAño % CONSEJOS_DESCANSO.length];

  function generar(g) {
    setGrupo(g);
    const asignada = rutinaAsignadaDe(g);
    const elegidos = asignada ? asignada.ejercicios : generarRutina({ grupo: g, equipoDisponible, estilo, tiempo, lugar });
    setOrigenRutina(asignada ? { origen: asignada.origen, generado_en: asignada.generado_en } : null);
    setRutina(elegidos);
    const inicial = {};
    elegidos.forEach((ej) => {
      const { peso, referencia } = sugerirProgresion(ej, entrenamientos);
      const numSeries = ej.series || 1;
      const filas = Array.from({ length: numSeries }, (_, i) => ({
        peso: i === 0 ? peso : "",
        reps: "",
      }));
      inicial[ej.nombre] = { filas, referencia };
    });
    setRegistro(inicial);
  }

  async function generarConIA(g) {
    setGenerandoIA(true);
    try {
      await generarMiRutinaIA(g);
      const actualizadas = await obtenerMisRutinasAsignadas();
      setRutinasAsignadas(actualizadas);
      setGrupo(g);
      const asignada = actualizadas.find((r) => r.grupo === g);
      if (asignada) {
        setOrigenRutina({ origen: asignada.origen, generado_en: asignada.generado_en });
        setRutina(asignada.ejercicios);
        const inicial = {};
        asignada.ejercicios.forEach((ej) => {
          const { peso, referencia } = sugerirProgresion(ej, entrenamientos);
          const numSeries = ej.series || 1;
          const filas = Array.from({ length: numSeries }, (_, i) => ({ peso: i === 0 ? peso : "", reps: "" }));
          inicial[ej.nombre] = { filas, referencia };
        });
        setRegistro(inicial);
      }
    } catch {
      alert("No se pudo generar la rutina con IA, intenta de nuevo.");
    } finally {
      setGenerandoIA(false);
    }
  }

  function actualizarFila(nombreEj, index, campo, valor) {
    setRegistro((r) => {
      const filas = [...r[nombreEj].filas];
      filas[index] = { ...filas[index], [campo]: valor };
      return { ...r, [nombreEj]: { ...r[nombreEj], filas } };
    });
  }

  function agregarFila(nombreEj) {
    setRegistro((r) => ({
      ...r,
      [nombreEj]: { ...r[nombreEj], filas: [...r[nombreEj].filas, { peso: "", reps: "" }] },
    }));
  }

  function quitarFila(nombreEj, index) {
    setRegistro((r) => {
      const filas = r[nombreEj].filas.filter((_, i) => i !== index);
      return { ...r, [nombreEj]: { ...r[nombreEj], filas } };
    });
  }

  function guardarSesion() {
    const ejerciciosGuardados = rutina
      .map((ej) => {
        const series = (registro[ej.nombre]?.filas || [])
          .filter((f) => f.peso)
          .map((f) => ({ peso: Number(f.peso), reps: f.reps ? Number(f.reps) : null }));
        return { nombre: ej.nombre, repsObjetivo: ej.reps, series };
      })
      .filter((ej) => ej.series.length > 0);
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
            lugar === "casa" ? "bg-[var(--btn)] border-[var(--btn)] text-[var(--bg)]" : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          <Home size={16} /> Casa
        </button>
        <button
          onClick={() => { setLugar("gimnasio"); setRutina(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium ${
            lugar === "gimnasio" ? "bg-[var(--btn)] border-[var(--btn)] text-[var(--bg)]" : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          <Building2 size={16} /> Gimnasio
        </button>
      </div>
      <p className="text-[11px] text-[var(--muted2)] -mt-3">
        {lugar === "casa"
          ? "Prioriza pesas libres y peso corporal con tu equipo registrado."
          : "Prioriza máquinas y cable, asumiendo que tienes acceso a todo."}
      </p>

      {!rutina && (
        <>
          <div>
            <p className="text-xs text-[var(--muted)] mb-2 flex items-center gap-1.5">
              <Clock size={12} /> ¿Cuánto tiempo tienes hoy?
            </p>
            <div className="flex gap-2">
              {TIEMPOS_DISPONIBLES.map((t) => (
                <Chip key={t.id} active={tiempo === t.id} onClick={() => setTiempo(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-[var(--muted2)] mt-1.5">
              {tiempo <= 30 && "Solo movimientos compuestos principales — rutina corta y eficiente."}
              {tiempo === 45 && "Compuestos + accesorios — rutina balanceada."}
              {tiempo >= 60 && "Rutina completa: compuestos con una serie extra, accesorios y aislamiento."}
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--muted)] mb-2 flex items-center gap-1.5">
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
            <button
              onClick={() => setVerSemana(!verSemana)}
              className="w-full flex items-center justify-between text-left"
            >
              <p className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                <Calendar size={12} /> Tu plan de esta semana ({perfil.dias_entreno || 3} días)
              </p>
              {verSemana ? (
                <ChevronUp size={14} color="var(--muted)" />
              ) : (
                <ChevronDown size={14} color="var(--muted)" />
              )}
            </button>

            {verSemana && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                {DIAS_SEMANA.slice(1).concat(DIAS_SEMANA[0]).map((nombreDia) => {
                  // DIAS_SEMANA está indexado dom=0..sab=6; reordenamos para mostrar lunes primero
                  const indiceReal = DIAS_SEMANA.indexOf(nombreDia);
                  const g = planSemanal[indiceReal];
                  const esHoy = indiceReal === diaSemanaHoy;
                  return (
                    <div
                      key={nombreDia}
                      className={`flex items-center justify-between px-4 py-2.5 ${
                        esHoy ? "bg-[var(--accent-10)]" : ""
                      } border-b border-[var(--border)] last:border-b-0`}
                    >
                      <p className={`text-xs ${esHoy ? "text-[var(--accent)] font-semibold" : "text-[var(--muted)]"}`}>
                        {nombreDia} {esHoy && "· hoy"}
                      </p>
                      <p className={`text-xs ${esHoy ? "text-[var(--text)] font-semibold" : "text-[var(--muted2)]"}`}>
                        {g ? NOMBRE_DIA_GRUPO[g] : "Descanso"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {grupoSugeridoHoy && (
              <button
                onClick={() => generar(grupoSugeridoHoy)}
                className="w-full bg-[var(--card)] border-2 border-[var(--accent)] rounded-xl px-4 py-4 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--muted2)]">Según tu plan, hoy {nombreDiaHoy.toLowerCase()} toca</p>
                  <p className="font-semibold text-white text-base mt-0.5">{NOMBRE_DIA_GRUPO[grupoSugeridoHoy]}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">Toca para generar la rutina de hoy</p>
                </div>
                <ChevronRight size={18} color="var(--text)" />
              </button>
            )}
            {!grupoSugeridoHoy && (
              <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3.5">
                <p className="text-sm text-[var(--muted)]">Hoy {nombreDiaHoy.toLowerCase()} te tocaría descansar según tu plan.</p>
                <p className="text-xs text-[var(--accent)] mt-2">💡 {consejoDescansoHoy}</p>
                <p className="text-[11px] text-[var(--muted2)] mt-2">Si igual quieres entrenar, elige un grupo abajo.</p>
              </div>
            )}
            <p className="text-xs text-[var(--muted)] pt-1">O elige otro grupo manualmente:</p>
            {GRUPOS.map((g) => {
              const asignada = rutinaAsignadaDe(g.id);
              return (
                <div key={g.id} className="flex gap-2">
                  <button
                    onClick={() => generar(g.id)}
                    className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between text-left"
                  >
                    <div>
                      <p className="font-semibold text-sm">{g.label}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {asignada
                          ? asignada.origen === "entrenador"
                            ? "Asignada por tu entrenador"
                            : "Generada por IA"
                          : g.sub}
                      </p>
                    </div>
                    <ChevronRight size={18} color="var(--muted2)" />
                  </button>
                  <button
                    onClick={() => generarConIA(g.id)}
                    disabled={generandoIA}
                    title="Generar con IA"
                    className="w-12 shrink-0 bg-[var(--card)] border border-[var(--accent-40)] rounded-xl flex items-center justify-center disabled:opacity-50"
                  >
                    <Sparkles size={16} color="var(--accent)" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {rutina && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--accent)]">
              {NOMBRE_DIA_GRUPO[grupo] || GRUPOS.find((g) => g.id === grupo)?.label} · {lugar === "casa" ? "Casa" : "Gimnasio"} · {tiempo} min
            </p>
            <button onClick={() => { setRutina(null); setGrupo(null); }} className="text-xs text-[var(--muted)]">
              Cambiar
            </button>
          </div>

          {origenRutina && (
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              {origenRutina.origen === "entrenador" ? <UserCheck size={12} /> : <Sparkles size={12} color="var(--accent)" />}
              {origenRutina.origen === "entrenador"
                ? "Rutina asignada por tu entrenador"
                : `Generada por IA · ${Math.floor((Date.now() - new Date(origenRutina.generado_en)) / 86400000)} días`}
            </div>
          )}

          {origenRutina?.origen === "ia" &&
            Math.floor((Date.now() - new Date(origenRutina.generado_en)) / 86400000) >= 60 && (
              <div className="bg-[var(--warning-bg)] border border-[var(--warning-40)] rounded-xl p-3.5 flex items-center justify-between gap-2">
                <p className="text-xs text-[var(--text)]">Esta rutina ya tiene más de 2 meses — renuévala para variar el estímulo.</p>
                <button
                  onClick={() => generarConIA(grupo)}
                  disabled={generandoIA}
                  className="shrink-0 bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] text-xs font-semibold rounded-lg px-3 py-1.5 disabled:opacity-50"
                >
                  Renovar
                </button>
              </div>
            )}

          {rutina.length === 0 && (
            <p className="text-sm text-[var(--muted)] bg-[var(--card)] rounded-xl p-4">
              No tienes equipo suficiente para este grupo todavía. Prueba otro grupo o revisa tu equipo en Perfil.
            </p>
          )}

          {rutina.length > 0 && CALENTAMIENTO[grupo] && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3.5">
              <p className="text-xs font-semibold text-[var(--accent)] mb-1.5">🔥 Calentamiento (5 min)</p>
              <ul className="space-y-1">
                {CALENTAMIENTO[grupo].map((paso, i) => (
                  <li key={i} className="text-xs text-[var(--muted)]">
                    · {paso}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rutina.map((ej) => (
            <div key={ej.nombre} className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3.5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{ej.nombre}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {ej.series} series × {ej.reps}
                  </p>
                </div>
                <a
                  href={urlVideoEjercicio(ej.nombre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[var(--muted)] border border-[var(--border)] rounded-full px-2 py-1 shrink-0"
                >
                  <PlayCircle size={12} /> Ver técnica
                </a>
              </div>
              {registro[ej.nombre]?.referencia && (
                <p className="text-[11px] text-[var(--accent)] mb-2 flex items-center gap-1">
                  <TrendingUp size={11} /> {registro[ej.nombre].referencia}
                </p>
              )}
              <div className="space-y-1.5">
                <div className="flex gap-2 text-[10px] text-[var(--muted2)] pl-7">
                  <span className="w-16">Peso kg</span>
                  <span className="w-16">Reps</span>
                </div>
                {(registro[ej.nombre]?.filas || []).map((fila, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="w-5 text-[10px] text-[var(--muted2)] text-center">{i + 1}</span>
                    <input
                      type="number"
                      value={fila.peso}
                      onChange={(e) => actualizarFila(ej.nombre, i, "peso", e.target.value)}
                      className="w-16 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                    />
                    <input
                      type="number"
                      placeholder={objetivoMaxReps(ej.reps) ? String(objetivoMaxReps(ej.reps)) : "reps"}
                      value={fila.reps}
                      onChange={(e) => actualizarFila(ej.nombre, i, "reps", e.target.value)}
                      className="w-16 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
                    />
                    {(registro[ej.nombre]?.filas || []).length > 1 && (
                      <button onClick={() => quitarFila(ej.nombre, i)} className="text-[var(--muted2)] text-xs px-1">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => agregarFila(ej.nombre)}
                  className="text-[11px] text-[var(--muted)] pl-7 flex items-center gap-1"
                >
                  <Plus size={11} /> Agregar serie
                </button>
              </div>
            </div>
          ))}

          {rutina.length > 0 && (
            <button
              onClick={guardarSesion}
              className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--bg)] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              <Check size={16} /> Guardar sesión de hoy
            </button>
          )}
        </div>
      )}
    </div>
  );
}
