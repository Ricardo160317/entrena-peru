import { useState } from "react";
import { Plus, Trash2, Flame } from "lucide-react";
import { ALIMENTOS, calcularMacros, hoy } from "../data";
import { Anillo, BarraMacro } from "./Comunes";

export default function Nutricion({ perfil, diaHoy, onGuardarDia }) {
  const metas = calcularMacros(perfil);
  const [buscar, setBuscar] = useState("");

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

  function agregarAlimento(a) {
    const nuevo = { nombre: a.nombre, kcal: a.kcal, prot: a.prot, carb: a.carb, grasa: a.grasa };
    onGuardarDia(hoy(), [...comidas, nuevo]);
    setBuscar("");
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
      <div className="bg-[#1E2422] border border-[#2A312E] rounded-xl p-4">
        <p className="text-xs text-[#9CA39C] mb-3">Tu meta diaria</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Anillo pct={totales.kcal / metas.kcal} color="#C1272D" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame size={14} color="#C1272D" />
              <p className="text-[11px] font-semibold">{totales.kcal}</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <BarraMacro label="Proteína" valor={totales.prot} meta={metas.prot} color="#C1272D" />
            <BarraMacro label="Carbos" valor={totales.carb} meta={metas.carb} color="#D4A017" />
            <BarraMacro label="Grasa" valor={totales.grasa} meta={metas.grasa} color="#7A9B57" />
          </div>
        </div>
        <p className="text-[11px] text-[#6E756F] mt-3">
          Meta: {metas.kcal} kcal · {metas.prot}g prot · {metas.carb}g carbs · {metas.grasa}g grasa
        </p>
      </div>

      <div className="bg-[#1E2422] border border-[#2A312E] rounded-xl p-4">
        <p className="text-xs text-[#D4A017] font-medium mb-1">Consejo rápido</p>
        <p className="text-sm text-[#F2EFE9]">{consejo}</p>
      </div>

      <div>
        <p className="text-xs text-[#9CA39C] mb-2">Agregar comida peruana</p>
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar: pollo, ceviche, quinoa…"
          className="w-full bg-[#1E2422] border border-[#3A4340] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4A017]"
        />
        {filtrados.length > 0 && (
          <div className="mt-2 space-y-2">
            {filtrados.slice(0, 6).map((a) => (
              <button
                key={a.nombre}
                onClick={() => agregarAlimento(a)}
                className="w-full bg-[#1E2422] border border-[#2A312E] rounded-lg px-3 py-2.5 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm">{a.nombre}</p>
                  <p className="text-xs text-[#6E756F]">
                    {a.kcal} kcal · {a.prot}g prot
                  </p>
                </div>
                <Plus size={16} color="#D4A017" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-[#9CA39C] mb-2">Hoy comiste</p>
        {comidas.length === 0 && (
          <p className="text-sm text-[#6E756F] bg-[#1E2422] rounded-xl p-4">Aún no registras comidas hoy.</p>
        )}
        <div className="space-y-2">
          {comidas.map((c, i) => (
            <div key={i} className="bg-[#1E2422] border border-[#2A312E] rounded-lg px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm">{c.nombre}</p>
                <p className="text-xs text-[#6E756F]">
                  {c.kcal} kcal · P {c.prot}g · C {c.carb}g · G {c.grasa}g
                </p>
              </div>
              <button onClick={() => quitarComida(i)}>
                <Trash2 size={15} color="#6E756F" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
