import { useEffect, useState } from "react";
import { Copy, Check, Users, ClipboardList, FileDown, Sparkles, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import {
  obtenerClientesEntrenador,
  obtenerRutinasFavoritas,
  asignarRutinaFavorita,
  asignarRutinaIA,
  descargarInformePDF,
  crearRutinaFavorita,
} from "../api";
import { fechaLegible, GRUPOS, EJERCICIOS, SUBGRUPOS_COMBINADOS } from "../data";
import RutinasFavoritas from "./RutinasFavoritas";

const DIAS_INACTIVO_ALERTA = 7;

export default function MisClientes() {
  const [vista, setVista] = useState("clientes"); // clientes | favoritas
  const [datos, setDatos] = useState(null);
  const [favoritas, setFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [asignandoA, setAsignandoA] = useState(null); // id del cliente con el panel abierto
  const [grupoAsignar, setGrupoAsignar] = useState("empuje");
  const [trabajando, setTrabajando] = useState(false);
  const [construyendoManual, setConstruyendoManual] = useState(false);
  const [nombreManual, setNombreManual] = useState("");
  const [seleccionManual, setSeleccionManual] = useState([]);
  const [mezclarTodoManual, setMezclarTodoManual] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  function cargar() {
    setCargando(true);
    Promise.all([obtenerClientesEntrenador(), obtenerRutinasFavoritas()])
      .then(([d, f]) => {
        setDatos(d);
        setFavoritas(f);
      })
      .finally(() => setCargando(false));
  }

  function copiarCodigo() {
    navigator.clipboard.writeText(datos.entrenador.codigo_invitacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function diasInactivo(c) {
    if (!c.ultima_sesion) return null;
    return Math.floor((Date.now() - new Date(c.ultima_sesion).getTime()) / 86400000);
  }

  function abrirAsignar(clienteId) {
    setAsignandoA(clienteId);
    setConstruyendoManual(false);
    setNombreManual("");
    setSeleccionManual([]);
  }

  async function asignarFavorita(clienteId, favoritaId) {
    setTrabajando(true);
    try {
      await asignarRutinaFavorita(clienteId, favoritaId);
      setAsignandoA(null);
      cargar();
    } finally {
      setTrabajando(false);
    }
  }

  async function asignarConIA(clienteId) {
    setTrabajando(true);
    try {
      await asignarRutinaIA(clienteId, grupoAsignar);
      setAsignandoA(null);
    } catch {
      alert("No se pudo generar la rutina con IA");
    } finally {
      setTrabajando(false);
    }
  }

  function toggleEjercicioManual(ej) {
    setSeleccionManual((s) =>
      s.some((e) => e.nombre === ej.nombre)
        ? s.filter((e) => e.nombre !== ej.nombre)
        : [...s, { nombre: ej.nombre, series: ej.series, reps: ej.reps }]
    );
  }

  function actualizarCampoManual(nombreEj, campo, valor) {
    setSeleccionManual((s) => s.map((e) => (e.nombre === nombreEj ? { ...e, [campo]: valor } : e)));
  }

  async function guardarYAsignarManual(clienteId) {
    if (!nombreManual || seleccionManual.length === 0) return;
    setTrabajando(true);
    try {
      const ejerciciosFinales = seleccionManual.map((e) => ({
        nombre: e.nombre,
        series: Number(e.series) || 1,
        reps: String(e.reps || "10"),
      }));
      const favoritaNueva = await crearRutinaFavorita(nombreManual, grupoAsignar, ejerciciosFinales);
      await asignarRutinaFavorita(clienteId, favoritaNueva.id);
      setAsignandoA(null);
      setConstruyendoManual(false);
      cargar();
    } catch {
      alert("No se pudo guardar y asignar la rutina");
    } finally {
      setTrabajando(false);
    }
  }

  if (cargando) return <p className="text-sm text-[var(--muted)]">Cargando…</p>;
  if (!datos) return <p className="text-sm text-[var(--muted)]">No se pudo cargar tu panel.</p>;

  const { clientes, entrenador } = datos;
  const limite = entrenador.limite_clientes;
  const gruposObjetivoManual = SUBGRUPOS_COMBINADOS[grupoAsignar] || [grupoAsignar];
  const ejerciciosDelGrupoManual = mezclarTodoManual
    ? EJERCICIOS
    : EJERCICIOS.filter((ej) => gruposObjetivoManual.includes(ej.grupo));

  return (
    <div className="space-y-5">
      <div className="flex gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1">
        <button
          onClick={() => setVista("clientes")}
          className={`flex-1 text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 ${
            vista === "clientes" ? "bg-[var(--btn)] text-[var(--btn-text)]" : "text-[var(--muted)]"
          }`}
        >
          <Users size={13} /> Clientes
        </button>
        <button
          onClick={() => setVista("favoritas")}
          className={`flex-1 text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 ${
            vista === "favoritas" ? "bg-[var(--btn)] text-[var(--btn-text)]" : "text-[var(--muted)]"
          }`}
        >
          <ClipboardList size={13} /> Rutinas favoritas
        </button>
      </div>

      {vista === "favoritas" && <RutinasFavoritas />}

      {vista === "clientes" && (
        <>
          <div className="bg-[var(--card)] border border-[var(--accent-40)] rounded-xl p-4">
            <p className="text-xs text-[var(--muted)] mb-1">Tu código de invitación</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold tracking-widest text-[var(--accent)]">{entrenador.codigo_invitacion}</p>
              <button onClick={copiarCodigo} className="ml-auto border border-[var(--border)] rounded-lg p-2">
                {copiado ? <Check size={15} color="var(--accent)" /> : <Copy size={15} color="var(--muted)" />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-2">
              Compártelo con tus clientes — deben ingresarlo al registrarse para quedar vinculados a ti.
            </p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} color="var(--accent)" />
              <p className="text-sm">Tus clientes</p>
            </div>
            <p className="text-sm font-semibold">
              {clientes.length}
              {limite != null ? ` / ${limite}` : ""}
            </p>
          </div>

          {limite != null && clientes.length >= limite && (
            <div className="bg-[var(--warning-bg)] border border-[var(--warning-40)] rounded-xl p-3.5">
              <p className="text-sm text-[var(--text)]">Llegaste al límite de tu plan actual ({entrenador.plan}).</p>
              <p className="text-xs text-[var(--muted)] mt-1">Escríbenos para subir de plan y aceptar más clientes.</p>
            </div>
          )}

          <div className="space-y-2">
            {clientes.length === 0 && (
              <p className="text-sm text-[var(--muted)] bg-[var(--card)] rounded-xl p-4">
                Aún no tienes clientes vinculados. Comparte tu código para que se registren.
              </p>
            )}
            {clientes.map((c) => {
              const dias = diasInactivo(c);
              const inactivo = dias === null || dias >= DIAS_INACTIVO_ALERTA;
              return (
                <div key={c.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{c.email}</p>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">
                        Registrado {fechaLegible(c.creado_en)}
                        {c.ultima_sesion ? ` · Última sesión: ${fechaLegible(c.ultima_sesion)}` : " · Sin sesiones aún"}
                      </p>
                      {inactivo && (
                        <p className="text-[11px] text-[var(--warning)] mt-1 flex items-center gap-1">
                          <AlertTriangle size={11} />
                          {dias === null ? "Nunca entrenó — hazle seguimiento" : `Sin entrenar hace ${dias} días`}
                        </p>
                      )}
                    </div>
                    <button onClick={() => descargarInformePDF(c.id)} title="Descargar informe">
                      <FileDown size={15} color="var(--muted)" />
                    </button>
                  </div>

                  {asignandoA !== c.id ? (
                    <button
                      onClick={() => abrirAsignar(c.id)}
                      className="mt-2 text-xs text-[var(--accent)] border border-[var(--border)] rounded-full px-2.5 py-1"
                    >
                      Asignar rutina
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2.5 border-t border-[var(--border)] pt-3">
                      <p className="text-[11px] text-[var(--muted)]">Grupo a asignar</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {GRUPOS.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => {
                              setGrupoAsignar(g.id);
                              setSeleccionManual([]);
                            }}
                            className={`px-2.5 py-1 rounded-full text-[11px] border ${
                              grupoAsignar === g.id
                                ? "bg-[var(--btn)] border-[var(--btn)] text-[var(--btn-text)]"
                                : "border-[var(--border)] text-[var(--muted)]"
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>

                      <p className="text-[11px] text-[var(--muted)] pt-1">Tus rutinas favoritas para este grupo</p>
                      {favoritas.filter((f) => f.grupo === grupoAsignar).length === 0 && (
                        <p className="text-[11px] text-[var(--muted2)]">No tienes rutinas favoritas para este grupo aún.</p>
                      )}
                      {favoritas
                        .filter((f) => f.grupo === grupoAsignar)
                        .map((f) => (
                          <button
                            key={f.id}
                            disabled={trabajando}
                            onClick={() => asignarFavorita(c.id, f.id)}
                            className="w-full text-left text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 disabled:opacity-50"
                          >
                            {f.nombre}
                          </button>
                        ))}

                      <button
                        disabled={trabajando}
                        onClick={() => asignarConIA(c.id)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs bg-[var(--accent-15)] border border-[var(--accent-40)] text-[var(--accent)] rounded-lg px-3 py-2 disabled:opacity-50"
                      >
                        <Sparkles size={12} /> Que la IA elija por mí
                      </button>

                      <button
                        onClick={() => setConstruyendoManual(!construyendoManual)}
                        className="w-full flex items-center justify-between text-xs text-[var(--text)] border border-[var(--border)] rounded-lg px-3 py-2"
                      >
                        Armar rutina manual ahora
                        {construyendoManual ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {construyendoManual && (
                        <div className="space-y-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3">
                          <input
                            value={nombreManual}
                            onChange={(e) => setNombreManual(e.target.value)}
                            placeholder="Nombre de la rutina"
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                          />
                          <button
                            onClick={() => setMezclarTodoManual(!mezclarTodoManual)}
                            className={`text-[10px] px-2 py-1 rounded-full border ${
                              mezclarTodoManual
                                ? "bg-[var(--accent-15)] border-[var(--accent)] text-[var(--accent)]"
                                : "border-[var(--border)] text-[var(--muted)]"
                            }`}
                          >
                            {mezclarTodoManual ? "✓ Mezclando todos los grupos" : "Mezclar todos los grupos"}
                          </button>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {ejerciciosDelGrupoManual.map((ej) => (
                              <button
                                key={ej.nombre}
                                onClick={() => toggleEjercicioManual(ej)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                                  seleccionManual.some((e) => e.nombre === ej.nombre)
                                    ? "bg-[var(--accent-15)] border-[var(--accent)]"
                                    : "border-[var(--border)]"
                                }`}
                              >
                                <span>
                                  {ej.nombre}
                                  {mezclarTodoManual && (
                                    <span className="text-[9px] text-[var(--muted2)] ml-1">
                                      ({GRUPOS.find((g) => g.id === ej.grupo)?.label || ej.grupo})
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-[var(--muted)]">
                                  {ej.series}x{ej.reps}
                                </span>
                              </button>
                            ))}
                          </div>

                          {seleccionManual.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {seleccionManual.map((e) => (
                                <div key={e.nombre} className="flex items-center gap-1.5">
                                  <p className="text-[10px] flex-1 truncate">{e.nombre}</p>
                                  <input
                                    type="number"
                                    value={e.series}
                                    onChange={(ev) => actualizarCampoManual(e.nombre, "series", ev.target.value)}
                                    className="w-10 bg-[var(--card)] border border-[var(--border)] rounded px-1 py-1 text-[10px] text-center outline-none"
                                  />
                                  <span className="text-[9px] text-[var(--muted2)]">×</span>
                                  <input
                                    value={e.reps}
                                    onChange={(ev) => actualizarCampoManual(e.nombre, "reps", ev.target.value)}
                                    placeholder="reps"
                                    className="w-16 bg-[var(--card)] border border-[var(--border)] rounded px-1 py-1 text-[10px] text-center outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => guardarYAsignarManual(c.id)}
                            disabled={trabajando || !nombreManual || seleccionManual.length === 0}
                            className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] disabled:opacity-40 text-[var(--btn-text)] text-xs font-semibold rounded-lg py-2"
                          >
                            Guardar y asignar a {c.email.split("@")[0]}
                          </button>
                        </div>
                      )}

                      <button onClick={() => setAsignandoA(null)} className="w-full text-[11px] text-[var(--muted)] py-1">
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
