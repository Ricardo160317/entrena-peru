import { useEffect, useState } from "react";
import { Copy, Check, Users, ClipboardList, FileDown, Sparkles } from "lucide-react";
import { obtenerClientesEntrenador, obtenerRutinasFavoritas, asignarRutinaFavorita, asignarRutinaIA, descargarInformePDF } from "../api";
import { fechaLegible, GRUPOS } from "../data";
import RutinasFavoritas from "./RutinasFavoritas";

export default function MisClientes() {
  const [vista, setVista] = useState("clientes"); // clientes | favoritas
  const [datos, setDatos] = useState(null);
  const [favoritas, setFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [asignandoA, setAsignandoA] = useState(null); // id del cliente con el panel abierto
  const [grupoAsignar, setGrupoAsignar] = useState("empuje");
  const [trabajando, setTrabajando] = useState(false);

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

  async function asignarFavorita(clienteId, favoritaId) {
    setTrabajando(true);
    try {
      await asignarRutinaFavorita(clienteId, favoritaId);
      setAsignandoA(null);
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

  if (cargando) return <p className="text-sm text-[var(--muted)]">Cargando…</p>;
  if (!datos) return <p className="text-sm text-[var(--muted)]">No se pudo cargar tu panel.</p>;

  const { clientes, entrenador } = datos;
  const limite = entrenador.limite_clientes;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1">
        <button
          onClick={() => setVista("clientes")}
          className={`flex-1 text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 ${
            vista === "clientes" ? "bg-[var(--accent)] text-[var(--on-accent)]" : "text-[var(--muted)]"
          }`}
        >
          <Users size={13} /> Clientes
        </button>
        <button
          onClick={() => setVista("favoritas")}
          className={`flex-1 text-xs font-medium rounded-lg py-2 flex items-center justify-center gap-1.5 ${
            vista === "favoritas" ? "bg-[var(--accent)] text-[var(--on-accent)]" : "text-[var(--muted)]"
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
            {clientes.map((c) => (
              <div key={c.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{c.email}</p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                      Registrado {fechaLegible(c.creado_en)}
                      {c.ultima_sesion ? ` · Última sesión: ${fechaLegible(c.ultima_sesion)}` : " · Sin sesiones aún"}
                    </p>
                  </div>
                  <button onClick={() => descargarInformePDF(c.id)} title="Descargar informe">
                    <FileDown size={15} color="var(--muted)" />
                  </button>
                </div>

                {asignandoA !== c.id ? (
                  <button
                    onClick={() => setAsignandoA(c.id)}
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
                          onClick={() => setGrupoAsignar(g.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] border ${
                            grupoAsignar === g.id
                              ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--on-accent)]"
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
                    <button onClick={() => setAsignandoA(null)} className="w-full text-[11px] text-[var(--muted)] py-1">
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
