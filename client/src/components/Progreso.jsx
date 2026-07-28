import { useMemo, useState } from "react";
import { GRUPOS, fechaLegible } from "../data";

export default function Progreso({ entrenamientos, medidas }) {
  const nombresEjercicios = useMemo(() => {
    const set = new Set();
    entrenamientos.forEach((s) => s.ejercicios.forEach((e) => set.add(e.nombre)));
    return Array.from(set);
  }, [entrenamientos]);

  const [seleccionado, setSeleccionado] = useState(null);

  const historialEjercicio = useMemo(() => {
    if (!seleccionado) return [];
    return entrenamientos
      .filter((s) => s.ejercicios.some((e) => e.nombre === seleccionado))
      .map((s) => ({ fecha: s.fecha, ...s.ejercicios.find((e) => e.nombre === seleccionado) }));
  }, [seleccionado, entrenamientos]);

  const maxPeso = Math.max(1, ...historialEjercicio.map((h) => h.peso));
  const ultimaMedida = medidas && medidas.length > 0 ? medidas[medidas.length - 1] : null;

  if (entrenamientos.length === 0 && (!medidas || medidas.length === 0)) {
    return (
      <div className="bg-[#1E2422] border border-[#2A312E] rounded-xl p-6 text-center mt-4">
        <p className="text-sm text-[#9CA39C]">
          Todavía no registras sesiones. Ve a la pestaña Entrenar y guarda tu primera rutina.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {ultimaMedida && (
        <div>
          <p className="text-xs text-[#9CA39C] mb-2">Última medición de tu balanza</p>
          <div className="bg-[#1E2422] border border-[#2A312E] rounded-xl p-4 grid grid-cols-4 gap-2 text-center">
            <MiniStat label="Grasa" valor={ultimaMedida.grasa_pct} sufijo="%" />
            <MiniStat label="Músculo" valor={ultimaMedida.musculo_pct} sufijo="%" />
            <MiniStat label="Agua" valor={ultimaMedida.agua_pct} sufijo="%" />
            <MiniStat label="Visceral" valor={ultimaMedida.visceral} sufijo="" />
          </div>
          <p className="text-[10px] text-[#6E756F] mt-1.5 text-right">{fechaLegible(String(ultimaMedida.fecha).slice(0, 10))}</p>
        </div>
      )}

      {entrenamientos.length > 0 && (
        <>
          <div>
            <p className="text-xs text-[#9CA39C] mb-2">Sesiones recientes</p>
            <div className="space-y-2">
              {[...entrenamientos].reverse().slice(0, 6).map((s, i) => (
                <div key={i} className="bg-[#1E2422] border border-[#2A312E] rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{GRUPOS.find((g) => g.id === s.grupo)?.label || s.grupo}</p>
                    <p className="text-xs text-[#9CA39C]">
                      {fechaLegible(s.fecha)} · {s.lugar === "casa" ? "Casa" : "Gimnasio"} · {s.ejercicios.length} ejercicios
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[#9CA39C] mb-2">Evolución de un ejercicio</p>
            <select
              value={seleccionado || ""}
              onChange={(e) => setSeleccionado(e.target.value || null)}
              className="w-full bg-[#1E2422] border border-[#3A4340] rounded-lg px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Elige un ejercicio</option>
              {nombresEjercicios.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            {seleccionado && historialEjercicio.length > 0 && (
              <div className="mt-3 bg-[#1E2422] border border-[#2A312E] rounded-xl p-4">
                <div className="flex items-end gap-2 h-32">
                  {historialEjercicio.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full bg-[#7A9B57] rounded-t"
                        style={{ height: `${(h.peso / maxPeso) * 100}%`, minHeight: 4 }}
                      />
                      <p className="text-[10px] text-[#6E756F]">{h.peso}kg</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#6E756F] mt-2 text-center">
                  {fechaLegible(historialEjercicio[0].fecha)} → {fechaLegible(historialEjercicio[historialEjercicio.length - 1].fecha)}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, valor, sufijo }) {
  return (
    <div>
      <p className="text-sm font-semibold">{valor != null ? `${valor}${sufijo}` : "—"}</p>
      <p className="text-[10px] text-[#6E756F]">{label}</p>
    </div>
  );
}
