import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { GRUPOS, fechaLegible } from "../data";
import SeguidorMedidas from "./SeguidorMedidas";

const tooltipStyle = {
  backgroundColor: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  fontSize: 12,
  color: "#111827",
};

export default function Progreso({ entrenamientos, medidas, onMedidaGuardada }) {
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
      .map((s) => ({
        fechaCorta: fechaLegible(s.fecha),
        peso: s.ejercicios.find((e) => e.nombre === seleccionado).peso,
      }));
  }, [seleccionado, entrenamientos]);

  const datosComposicion = useMemo(() => {
    return (medidas || [])
      .filter((m) => m.grasa_pct || m.musculo_pct || m.agua_pct)
      .map((m) => ({
        fechaCorta: fechaLegible(m.fecha),
        grasa: m.grasa_pct != null ? Number(m.grasa_pct) : null,
        musculo: m.musculo_pct != null ? Number(m.musculo_pct) : null,
        agua: m.agua_pct != null ? Number(m.agua_pct) : null,
      }));
  }, [medidas]);

  const sesionesPorSemana = useMemo(() => {
    const conteo = {};
    entrenamientos.forEach((s) => {
      const fecha = new Date(String(s.fecha).slice(0, 10) + "T00:00:00");
      const inicioSemana = new Date(fecha);
      inicioSemana.setDate(fecha.getDate() - fecha.getDay());
      const clave = inicioSemana.toISOString().slice(0, 10);
      conteo[clave] = (conteo[clave] || 0) + 1;
    });
    return Object.entries(conteo)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([semana, total]) => ({ semana: fechaLegible(semana), total }));
  }, [entrenamientos]);

  const ultimaMedida = medidas && medidas.length > 0 ? medidas[medidas.length - 1] : null;

  const sinNadaAun = entrenamientos.length === 0 && (!medidas || medidas.length === 0);

  return (
    <div className="space-y-6">
      <SeguidorMedidas medidas={medidas} onMedidaGuardada={onMedidaGuardada} />

      {sinNadaAun && (
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 text-center">
          <p className="text-sm text-[#6B7280]">
            Todavía no registras sesiones. Ve a la pestaña Entrenar y guarda tu primera rutina.
          </p>
        </div>
      )}

      {ultimaMedida && (
        <div>
          <p className="text-xs text-[#6B7280] mb-2">Última medición de tu balanza</p>
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4 grid grid-cols-4 gap-2 text-center">
            <MiniStat label="Grasa" valor={ultimaMedida.grasa_pct} sufijo="%" />
            <MiniStat label="Músculo" valor={ultimaMedida.musculo_pct} sufijo="%" />
            <MiniStat label="Agua" valor={ultimaMedida.agua_pct} sufijo="%" />
            <MiniStat label="Visceral" valor={ultimaMedida.visceral} sufijo="" />
          </div>
          <p className="text-[10px] text-[#9CA3AF] mt-1.5 text-right">{fechaLegible(String(ultimaMedida.fecha).slice(0, 10))}</p>
        </div>
      )}

      {datosComposicion.length > 1 && (
        <div>
          <p className="text-xs text-[#6B7280] mb-2">Evolución de tu composición corporal</p>
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={datosComposicion} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="fechaCorta" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="grasa" name="Grasa %" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="musculo" name="Músculo %" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="agua" name="Agua %" stroke="#15803D" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-1">
              <Leyenda color="#F59E0B" label="Grasa" />
              <Leyenda color="#22C55E" label="Músculo" />
              <Leyenda color="#15803D" label="Agua" />
            </div>
          </div>
        </div>
      )}

      {sesionesPorSemana.length > 0 && (
        <div>
          <p className="text-xs text-[#6B7280] mb-2">Frecuencia de entrenamiento (últimas semanas)</p>
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={sesionesPorSemana} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="semana" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total" name="Sesiones" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {entrenamientos.length > 0 && (
        <>
          <div>
            <p className="text-xs text-[#6B7280] mb-2">Sesiones recientes</p>
            <div className="space-y-2">
              {[...entrenamientos].reverse().slice(0, 6).map((s, i) => (
                <div key={i} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{GRUPOS.find((g) => g.id === s.grupo)?.label || s.grupo}</p>
                    <p className="text-xs text-[#6B7280]">
                      {fechaLegible(s.fecha)} · {s.lugar === "casa" ? "Casa" : "Gimnasio"} · {s.ejercicios.length} ejercicios
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[#6B7280] mb-2">Evolución de un ejercicio</p>
            <select
              value={seleccionado || ""}
              onChange={(e) => setSeleccionado(e.target.value || null)}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Elige un ejercicio</option>
              {nombresEjercicios.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            {seleccionado && historialEjercicio.length > 0 && (
              <div className="mt-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={historialEjercicio} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="fechaCorta" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kg`, "Peso"]} />
                    <Line type="monotone" dataKey="peso" stroke="#111827" strokeWidth={2.5} dot={{ r: 4, fill: "#111827" }} />
                  </LineChart>
                </ResponsiveContainer>
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
      <p className="text-[10px] text-[#9CA3AF]">{label}</p>
    </div>
  );
}

function Leyenda({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-[#6B7280]">{label}</span>
    </div>
  );
}
