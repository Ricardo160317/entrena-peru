import { useRef, useState } from "react";
import { Plus, Trash2, Flame, Camera, Loader2 } from "lucide-react";
import { ALIMENTOS, calcularMacros, hoy } from "../data";
import { Anillo, BarraMacro } from "./Comunes";
import { redimensionarImagen } from "../imageUtils";
import { analizarFotoComida } from "../api";

export default function Nutricion({ perfil, diaHoy, onGuardarDia }) {
  const metas = calcularMacros(perfil);
  const [buscar, setBuscar] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [gramos, setGramos] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");
  const inputFotoRef = useRef(null);

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

  async function elegirFotoComida(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setAnalizando(true);
    setErrorFoto("");
    try {
      const dataUrl = await redimensionarImagen(archivo, 700, 0.6);
      const resultado = await analizarFotoComida(dataUrl);
      if (!resultado.kcal && resultado.nombre === "No identificado") {
        setErrorFoto("No pude reconocer comida en esa foto, intenta con otra o agrégala manualmente.");
        return;
      }
      setSeleccionado({
        nombre: `${resultado.nombre} (estimado por foto)`,
        gramos: resultado.gramos_estimados || 100,
        kcal: resultado.kcal,
        prot: resultado.prot,
        carb: resultado.carb,
        grasa: resultado.grasa,
      });
      setGramos(String(resultado.gramos_estimados || 100));
    } catch (err) {
      setErrorFoto(err.message);
    } finally {
      setAnalizando(false);
    }
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
      <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4">
        <p className="text-xs text-[#6B7280] mb-3">Tu meta diaria</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Anillo pct={totales.kcal / metas.kcal} color="#111827" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame size={14} color="#111827" />
              <p className="text-[11px] font-semibold">{totales.kcal}</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <BarraMacro label="Proteína" valor={totales.prot} meta={metas.prot} color="#111827" />
            <BarraMacro label="Carbos" valor={totales.carb} meta={metas.carb} color="#15803D" />
            <BarraMacro label="Grasa" valor={totales.grasa} meta={metas.grasa} color="#22C55E" />
          </div>
        </div>
        <p className="text-[11px] text-[#9CA3AF] mt-3">
          Meta: {metas.kcal} kcal · {metas.prot}g prot · {metas.carb}g carbs · {metas.grasa}g grasa
        </p>
      </div>

      <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4">
        <p className="text-xs text-[#15803D] font-medium mb-1">Consejo rápido</p>
        <p className="text-sm text-[#111827]">{consejo}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[#6B7280]">Agregar comida</p>
          <button
            onClick={() => inputFotoRef.current?.click()}
            disabled={analizando}
            className="text-xs text-[#15803D] flex items-center gap-1 border border-[#E5E7EB] rounded-full px-2.5 py-1 disabled:opacity-50"
          >
            {analizando ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {analizando ? "Analizando…" : "Foto de tu comida"}
          </button>
          <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" onChange={elegirFotoComida} className="hidden" />
        </div>
        {errorFoto && <p className="text-xs text-[#EF4444] mb-2">{errorFoto}</p>}
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar: pollo, ceviche, quinoa…"
          className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#15803D]"
        />
        {filtrados.length > 0 && (
          <div className="mt-2 space-y-2">
            {filtrados.slice(0, 6).map((a) => (
              <button
                key={a.nombre}
                onClick={() => elegirAlimento(a)}
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2.5 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm">{a.nombre}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    Base: {a.gramos}g · {a.kcal} kcal · {a.prot}g prot
                  </p>
                </div>
                <Plus size={16} color="#15803D" />
              </button>
            ))}
          </div>
        )}

        {seleccionado && (
          <div className="mt-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3.5">
            <p className="text-sm font-medium mb-2">{seleccionado.nombre}</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                autoFocus
                value={gramos}
                onChange={(e) => setGramos(e.target.value)}
                className="w-24 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-sm outline-none focus:border-[#15803D]"
              />
              <span className="text-xs text-[#6B7280]">gramos</span>
              <button onClick={agregarConGramos} className="ml-auto bg-[#111827] hover:bg-[#374151] text-white text-sm rounded-lg px-4 py-2">
                Agregar
              </button>
            </div>
            {gramos && (
              <p className="text-[11px] text-[#9CA3AF] mt-2">
                ≈ {Math.round(seleccionado.kcal * (Number(gramos) / seleccionado.gramos))} kcal ·{" "}
                {Math.round(seleccionado.prot * (Number(gramos) / seleccionado.gramos) * 10) / 10}g prot
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-[#6B7280] mb-2">Hoy comiste</p>
        {comidas.length === 0 && (
          <p className="text-sm text-[#9CA3AF] bg-[#F8FAFC] rounded-xl p-4">Aún no registras comidas hoy.</p>
        )}
        <div className="space-y-2">
          {comidas.map((c, i) => (
            <div key={i} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm">{c.nombre}</p>
                <p className="text-xs text-[#9CA3AF]">
                  {c.kcal} kcal · P {c.prot}g · C {c.carb}g · G {c.grasa}g
                </p>
              </div>
              <button onClick={() => quitarComida(i)}>
                <Trash2 size={15} color="#9CA3AF" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
