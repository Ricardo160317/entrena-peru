import { useState } from "react";
import { Plus, Trash2, Flame } from "lucide-react";
import { ALIMENTOS, calcularMacros, hoy } from "../data";
import { Anillo, BarraMacro } from "./Comunes";

export default function Nutricion({ perfil, diaHoy, onGuardarDia }) {
  const metas = calcularMacros(perfil);
  const [buscar, setBuscar] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [gramos, setGramos] = useState("");

  const comidas = diaHoy?.comidas || [];

  const totales = comidas.reduce(
    (acc, c) => ({
      kcal: acc.kcal + c.kcal,
      prot: acc.prot + c.prot,
      carb: acc.carb + c.carb,
      grasa: acc.grasa + c.grasa,
    }),
    { kcal: 0, prot: 0, carb: 0, grasa: 0 }
  );

  const filtrados = buscar ? ALIMENTOS.filter((a) => a.nombre.toLowerCase().includes(buscar.toLowerCase())) : [];

  function elegirAlimento(a) {
    setSeleccionado(a);
    setGramos(String(a.gramos));
    setBuscar("");
  }

  function agregarConGramos() {
    if (!seleccionado || !gramos) return;
    const factor = Number(gramos) / seleccionado.gramos;
    const nuevo = {
      nombre: `${seleccionado.nombre} (${gramos}g)`,
      kcal: Math.round(seleccionado.kcal * factor),
      prot: Math.round(seleccionado.prot * factor * 10) / 10,
      carb: Math.round(seleccionado.carb * factor * 10) / 10,
      grasa: Math.round(seleccionado.grasa * factor * 10) / 10,
    };
    onGuardarDia(hoy(), [...comidas, nuevo]);
    setSeleccionado(null);
    setGramos("");
  }

  function quitarComida(idx) {
    onGuardarDia(hoy(), comidas.filter((_, i) => i !== idx));
  }

  const faltaProt = Math.max(0, metas.prot - totales.prot);
  let consejo = "Vas bien encaminado, sigue registrando tus comidas.";
  if (faltaProt > 25) {
    consejo = `Te faltan ${Math.round(faltaProt)}g de proteína hoy. Suma pechuga a la plancha, pescado o atún en agua.`;
  } else if (totales.kcal > metas.kcal + 200) {
    consejo = "Ya pasaste tu meta de calorías de hoy. Si tienes hambre, prioriza vegetales y proteína magra.";
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1A2028] border border-[#263140] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] p-4">
        <p className="text-xs text-[#8B96A3] mb-3">Tu meta diaria</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Anillo pct={totales.kcal / metas.kcal} color="#A32638" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame size={14} color="#A32638" />
              <p className="text-[11px] font-semibold">{totales.kcal}</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <BarraMacro label="Proteína" valor={totales.prot} meta={metas.prot} color="#A32638" />
            <BarraMacro label="Carbos" valor={totales.carb} meta={metas.carb} color="#C9A227" />
            <BarraMacro label="Grasa" valor={totales.grasa} meta={metas.grasa} color="#6B8F4E" />
          </div>
        </div>
        <p className="text-[11px] text-[#6B7684] mt-3">
          Meta: {metas.kcal} kcal · {metas.prot}g prot · {metas.carb}g carbs · {metas.grasa}g grasa
        </p>
      </div>

      <div className="bg-[#1A2028] border border-[#263140] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] p-4">
        <p className="text-xs text-[#C9A227] font-medium mb-1">Consejo rápido</p>
        <p className="text-sm text-[#F2EFE9]">{consejo}</p>
      </div>

      <div>
        <p className="text-xs text-[#8B96A3] mb-2">Agregar comida</p>
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar: pollo, ceviche, quinoa…"
          className="w-full bg-[#1A2028] border border-[#2F3A47] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#C9A227]"
        />
        {filtrados.length > 0 && (
          <div className="mt-2 space-y-2">
            {filtrados.slice(0, 6).map((a) => (
              <button
                key={a.nombre}
                onClick={() => elegirAlimento(a)}
                className="w-full bg-[#1A2028] border border-[#263140] rounded-lg px-3 py-2.5 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm">{a.nombre}</p>
                  <p className="text-xs text-[#6B7684]">
                    Base: {a.gramos}g · {a.kcal} kcal · {a.prot}g prot
                  </p>
                </div>
                <Plus size={16} color="#C9A227" />
              </button>
            ))}
          </div>
        )}

        {seleccionado && (
          <div className="mt-3 bg-[#1A2028] border border-[#263140] rounded-lg p-3.5">
            <p className="text-sm font-medium mb-2">{seleccionado.nombre}</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                autoFocus
                value={gramos}
                onChange={(e) => setGramos(e.target.value)}
                className="w-24 bg-[#0F1318] border border-[#2F3A47] rounded-lg px-2.5 py-2 text-sm outline-none focus:border-[#C9A227]"
              />
              <span className="text-xs text-[#8B96A3]">gramos</span>
              <button onClick={agregarConGramos} className="ml-auto bg-[#A32638] text-white text-sm rounded-lg px-4 py-2">
                Agregar
              </button>
            </div>
            {gramos && (
              <p className="text-[11px] text-[#6B7684] mt-2">
                ≈ {Math.round(seleccionado.kcal * (Number(gramos) / seleccionado.gramos))} kcal ·{" "}
                {Math.round(seleccionado.prot * (Number(gramos) / seleccionado.gramos) * 10) / 10}g prot
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-[#8B96A3] mb-2">Hoy comiste</p>
        {comidas.length === 0 && (
          <p className="text-sm text-[#6B7684] bg-[#1A2028] rounded-xl p-4">Aún no registras comidas hoy.</p>
        )}
        <div className="space-y-2">
          {comidas.map((c, i) => (
            <div key={i} className="bg-[#1A2028] border border-[#263140] rounded-lg px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm">{c.nombre}</p>
                <p className="text-xs text-[#6B7684]">
                  {c.kcal} kcal · P {c.prot}g · C {c.carb}g · G {c.grasa}g
                </p>
              </div>
              <button onClick={() => quitarComida(i)}>
                <Trash2 size={15} color="#6B7684" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
