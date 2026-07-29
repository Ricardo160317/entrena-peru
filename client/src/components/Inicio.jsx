import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";
import { tipDelDia, TECNICAS_PRODUCTIVIDAD } from "../data";

const DURACIONES = { trabajo: 25 * 60, descanso: 5 * 60 };

export default function Inicio({ entrenamientos }) {
  const tip = tipDelDia();
  const [fase, setFase] = useState("trabajo");
  const [segundosRestantes, setSegundosRestantes] = useState(DURACIONES.trabajo);
  const [corriendo, setCorriendo] = useState(false);
  const [ciclos, setCiclos] = useState(0);
  const intervaloRef = useRef(null);

  useEffect(() => {
    if (!corriendo) {
      clearInterval(intervaloRef.current);
      return;
    }
    intervaloRef.current = setInterval(() => {
      setSegundosRestantes((s) => {
        if (s > 1) return s - 1;
        // se acabó la fase actual: cambia de fase y cuenta el ciclo si terminó "trabajo"
        setFase((f) => {
          if (f === "trabajo") setCiclos((c) => c + 1);
          return f === "trabajo" ? "descanso" : "trabajo";
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(intervaloRef.current);
  }, [corriendo]);

  useEffect(() => {
    setSegundosRestantes(DURACIONES[fase]);
  }, [fase]);

  function reiniciar() {
    setCorriendo(false);
    setFase("trabajo");
    setSegundosRestantes(DURACIONES.trabajo);
    setCiclos(0);
  }

  const minutos = String(Math.floor(segundosRestantes / 60)).padStart(2, "0");
  const segundos = String(segundosRestantes % 60).padStart(2, "0");

  const sesionesEstaSemana = (entrenamientos || []).filter((s) => {
    const f = new Date(String(s.fecha).slice(0, 10) + "T00:00:00");
    const hoyD = new Date();
    const inicioSemana = new Date(hoyD);
    inicioSemana.setDate(hoyD.getDate() - hoyD.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    return f >= inicioSemana;
  }).length;

  return (
    <div className="space-y-5">
      <div className="bg-[#111827] rounded-xl p-4">
        <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] flex items-center gap-1">
          <Sparkles size={11} /> Consejo del día · {tip.categoria}
        </p>
        <p className="text-white text-sm mt-1.5 leading-relaxed">{tip.texto}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5 text-center">
          <p className="text-xl font-bold text-[#111827]">{sesionesEstaSemana}</p>
          <p className="text-[11px] text-[#6B7280]">sesiones esta semana</p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5 text-center">
          <p className="text-xl font-bold text-[#111827]">{ciclos}</p>
          <p className="text-[11px] text-[#6B7280]">pomodoros hoy</p>
        </div>
      </div>

      <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-5 text-center">
        <p className="text-xs text-[#6B7280] mb-1">{fase === "trabajo" ? "Enfoque" : "Descanso"}</p>
        <p className="text-4xl font-bold tabular-nums text-[#111827]">
          {minutos}:{segundos}
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => setCorriendo(!corriendo)}
            className="bg-[#111827] hover:bg-[#374151] text-white rounded-full w-11 h-11 flex items-center justify-center"
          >
            {corriendo ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={reiniciar}
            className="border border-[#E5E7EB] text-[#6B7280] rounded-full w-11 h-11 flex items-center justify-center"
          >
            <RotateCcw size={16} />
          </button>
        </div>
        <p className="text-[10px] text-[#9CA3AF] mt-3">Técnica Pomodoro: 25 min de enfoque + 5 min de descanso</p>
      </div>

      <div>
        <p className="text-xs text-[#6B7280] mb-2">Otras técnicas de productividad</p>
        <div className="space-y-2">
          {TECNICAS_PRODUCTIVIDAD.map((t) => (
            <div key={t.nombre} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3">
              <p className="text-sm font-medium text-[#111827]">{t.nombre}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{t.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
