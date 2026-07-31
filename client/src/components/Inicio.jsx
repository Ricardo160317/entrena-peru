import { useEffect, useState } from "react";
import { Bell, Dumbbell, ChevronRight, AlertCircle, Flame, Trophy, Users, MessageSquare, AlertTriangle } from "lucide-react";
import { tipDelDia, calcularMacros, armarPlanSemanal, NOMBRE_DIA_GRUPO, DIAS_SEMANA, hoy } from "../data";
import { Anillo } from "./Comunes";
import { obtenerHabitos, obtenerClientesEntrenador, obtenerResumenChats } from "../api";

function DIAS_SIN_ENTRENAR_ALERTA() {
  return 7;
}

function nombreDeSaludo(usuario) {
  if (usuario?.nombre) return usuario.nombre.split(" ")[0];
  if (usuario?.email) return usuario.email.split("@")[0];
  return "";
}

function InicioEntrenador({ onIrATab, usuario }) {
  const [datos, setDatos] = useState(null);
  const [noLeidos, setNoLeidos] = useState(0);

  useEffect(() => {
    obtenerClientesEntrenador()
      .then(setDatos)
      .catch(() => setDatos({ clientes: [], entrenador: {} }));
    obtenerResumenChats()
      .then((r) => setNoLeidos(r.reduce((acc, c) => acc + c.noLeidos, 0)))
      .catch(() => {});
  }, []);

  if (!datos) return <p className="text-sm text-[var(--muted)]">Cargando…</p>;

  const hoyMs = Date.now();
  const inactivos = datos.clientes.filter((c) => {
    if (!c.ultima_sesion) return true;
    const dias = (hoyMs - new Date(c.ultima_sesion).getTime()) / 86400000;
    return dias >= DIAS_SIN_ENTRENAR_ALERTA();
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">¡Hola{nombreDeSaludo(usuario) ? `, ${nombreDeSaludo(usuario)}` : " de nuevo"}!</p>
          <p className="text-xs text-[var(--muted)]">Así están tus clientes hoy.</p>
        </div>
        <button
          onClick={() => onIrATab("chat")}
          className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center relative"
        >
          <Bell size={16} color="var(--muted)" />
          {noLeidos > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onIrATab("clientes")}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5 text-left"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={13} color="var(--azul)" />
            <p className="text-[11px] text-[var(--muted)]">Clientes</p>
          </div>
          <p className="text-xl font-bold" style={{ color: "var(--azul)" }}>
            {datos.clientes.length}
            {datos.entrenador.limite_clientes != null ? `/${datos.entrenador.limite_clientes}` : ""}
          </p>
        </button>
        <button
          onClick={() => onIrATab("chat")}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5 text-left"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare size={13} color="var(--morado)" />
            <p className="text-[11px] text-[var(--muted)]">Mensajes sin leer</p>
          </div>
          <p className="text-xl font-bold" style={{ color: "var(--morado)" }}>
            {noLeidos}
          </p>
        </button>
      </div>

      {inactivos.length > 0 && (
        <div className="bg-[var(--warning-bg)] border border-[var(--warning-40)] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={14} color="var(--warning)" />
            <p className="text-sm font-medium text-[var(--text)]">
              {inactivos.length} {inactivos.length === 1 ? "cliente" : "clientes"} sin entrenar hace {DIAS_SIN_ENTRENAR_ALERTA()}+ días
            </p>
          </div>
          <div className="space-y-1">
            {inactivos.slice(0, 5).map((c) => (
              <p key={c.id} className="text-xs text-[var(--muted)]">
                • {c.email} {c.ultima_sesion ? `— hace ${Math.floor((hoyMs - new Date(c.ultima_sesion).getTime()) / 86400000)} días` : "— nunca entrenó"}
              </p>
            ))}
          </div>
          <button onClick={() => onIrATab("clientes")} className="text-xs text-[var(--accent)] mt-2">
            Ver todos y hacer seguimiento →
          </button>
        </div>
      )}

      {inactivos.length === 0 && (
        <div className="bg-[var(--card)] border border-[var(--accent-40)] rounded-xl p-4">
          <p className="text-sm text-[var(--text)]">🎉 Todos tus clientes entrenaron en los últimos {DIAS_SIN_ENTRENAR_ALERTA()} días.</p>
        </div>
      )}
    </div>
  );
}

function semanaClave(fechaStr) {
  const d = new Date(String(fechaStr).slice(0, 10) + "T00:00:00");
  const dia = d.getDay();
  const diff = (dia === 0 ? -6 : 1) - dia;
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diff);
  lunes.setHours(0, 0, 0, 0);
  return lunes.toISOString().slice(0, 10);
}

function calcularRachaYSemanas(entrenamientos, metaDias) {
  const conteoPorSemana = {};
  (entrenamientos || []).forEach((s) => {
    const clave = semanaClave(s.fecha);
    conteoPorSemana[clave] = (conteoPorSemana[clave] || 0) + 1;
  });
  const semanas = Object.keys(conteoPorSemana);
  const completadas = semanas.filter((k) => conteoPorSemana[k] >= metaDias).length;

  const semanaActual = semanaClave(hoy());
  let racha = 0;
  let cursor = new Date();
  while (true) {
    const clave = semanaClave(cursor.toISOString().slice(0, 10));
    const cumplida = (conteoPorSemana[clave] || 0) >= metaDias;
    if (!cumplida) {
      if (clave === semanaActual) {
        cursor.setDate(cursor.getDate() - 7);
        continue;
      }
      break;
    }
    racha++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return { completadas, racha };
}

export default function Inicio({ perfil, entrenamientos, diaHoy, onIrATab, usuario }) {
  if (usuario?.rol === "entrenador") {
    return <InicioEntrenador onIrATab={onIrATab} usuario={usuario} />;
  }

  const tip = tipDelDia();
  const metas = calcularMacros(perfil);
  const [habitosPendientes, setHabitosPendientes] = useState(null);

  useEffect(() => {
    obtenerHabitos()
      .then((data) => {
        const marcadosHoy = new Set(
          data.registros.filter((r) => String(r.fecha).slice(0, 10) === hoy()).map((r) => r.habito_id)
        );
        const pendientes = data.habitos.filter((h) => !marcadosHoy.has(h.id));
        setHabitosPendientes(pendientes);
      })
      .catch(() => setHabitosPendientes([]));
  }, []);

  const inicioSemana = (() => {
    const d = new Date();
    const dom = new Date(d);
    dom.setDate(d.getDate() - d.getDay());
    dom.setHours(0, 0, 0, 0);
    return dom;
  })();
  const sesionesSemanaActual = (entrenamientos || []).filter(
    (s) => new Date(String(s.fecha).slice(0, 10) + "T00:00:00") >= inicioSemana
  );
  const sesionesEstaSemana = sesionesSemanaActual.length;
  const minutosEstaSemana = sesionesSemanaActual.reduce((acc, s) => acc + (s.duracion_min || 0), 0);
  const metaDias = perfil.dias_entreno || 3;

  const totalesHoy = (diaHoy?.comidas || []).reduce((acc, c) => ({ kcal: acc.kcal + c.kcal }), { kcal: 0 });

  const { completadas, racha } = calcularRachaYSemanas(entrenamientos, metaDias);

  const planSemanal = armarPlanSemanal(metaDias);
  const grupoHoy = planSemanal[new Date().getDay()];
  const nombreDiaHoy = DIAS_SEMANA[new Date().getDay()];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">¡Hola{nombreDeSaludo(usuario) ? `, ${nombreDeSaludo(usuario)}` : " de nuevo"}!</p>
          <p className="text-xs text-[var(--muted)]">Listo para superar tus límites hoy.</p>
        </div>
        <button className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center relative">
          <Bell size={16} color="var(--muted)" />
          {habitosPendientes && habitosPendientes.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full" />
          )}
        </button>
      </div>

      {habitosPendientes && habitosPendientes.length > 0 && (
        <button
          onClick={() => onIrATab("habitos")}
          className="w-full bg-[var(--warning-bg)] border border-[var(--warning-40)] rounded-xl p-3.5 flex items-start gap-2.5 text-left"
        >
          <AlertCircle size={16} color="var(--warning)" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[var(--text)] font-medium">Aún no marcas hoy: {habitosPendientes.map((h) => h.nombre).join(", ")}</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">Toca para ir a Hábitos</p>
          </div>
        </button>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[var(--muted)]">Tu progreso</p>
          <button onClick={() => onIrATab("progreso")} className="text-xs text-[var(--accent)]">
            Ver más
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Anillo pct={sesionesEstaSemana / metaDias} color="var(--azul)" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-sm font-bold">{Math.round((sesionesEstaSemana / metaDias) * 100)}%</p>
              <p className="text-[8px] text-[var(--muted2)]">esta semana</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--muted)]">Entrenamientos</span>
              <span className="font-semibold" style={{ color: "var(--azul)" }}>
                {sesionesEstaSemana}/{metaDias} días
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--muted)]">Calorías hoy</span>
              <span className="font-semibold" style={{ color: "var(--naranja)" }}>
                {totalesHoy.kcal}/{metas.kcal} kcal
              </span>
            </div>
            {minutosEstaSemana > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Minutos entrenados</span>
                <span className="font-semibold" style={{ color: "var(--azul)" }}>
                  {minutosEstaSemana} min
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame size={13} color="var(--morado)" />
            <p className="text-[11px] text-[var(--muted)]">Racha de semanas</p>
          </div>
          <p className="text-xl font-bold" style={{ color: "var(--morado)" }}>
            {racha}
          </p>
          <p className="text-[10px] text-[var(--muted2)]">cumpliendo tu meta seguido</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Trophy size={13} color="var(--morado)" />
            <p className="text-[11px] text-[var(--muted)]">Semanas completas</p>
          </div>
          <p className="text-xl font-bold" style={{ color: "var(--morado)" }}>
            {completadas}
          </p>
          <p className="text-[10px] text-[var(--muted2)]">en total</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-[var(--muted)] mb-2">Entrenamiento de hoy</p>
        <button
          onClick={() => onIrATab("entrenar")}
          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-15)] flex items-center justify-center">
              <Dumbbell size={18} color="var(--accent)" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{grupoHoy ? NOMBRE_DIA_GRUPO[grupoHoy] : "Descanso"}</p>
              <p className="text-xs text-[var(--muted)]">{nombreDiaHoy}</p>
            </div>
          </div>
          <ChevronRight size={18} color="var(--muted2)" />
        </button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--accent-40)] rounded-xl p-4">
        <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Consejo del día · {tip.categoria}</p>
        <p className="text-[var(--text)] text-sm mt-1.5 leading-relaxed">{tip.texto}</p>
      </div>
    </div>
  );
}
