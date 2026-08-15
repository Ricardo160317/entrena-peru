import { useRef, useState } from "react";
import { Plus, Trash2, Flame, Camera, Loader2, Sparkles, UtensilsCrossed } from "lucide-react";
import { ALIMENTOS, calcularMacros, hoy } from "../data";
import { Anillo, BarraMacro, EmptyState } from "./Comunes";
import { redimensionarImagen } from "../imageUtils";
import { analizarFotoComida, buscarMacrosPorTexto } from "../api";

export default function Nutricion({ perfil, diaHoy, onGuardarDia }) {
  const metas = calcularMacros(perfil);
  const [buscar, setBuscar] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [gramos, setGramos] = useState("");
  const [manualAbierto, setManualAbierto] = useState(false);
  const [manualForm, setManualForm] = useState({ nombre: "", kcal: "", prot: "", carb: "", grasa: "" });
  const [buscandoIA, setBuscandoIA] = useState(false);
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

  function agregarManual() {
    if (!manualForm.nombre || !manualForm.kcal) return;
    const nuevo = {
      nombre: manualForm.nombre,
      kcal: Number(manualForm.kcal) || 0,
      prot: Number(manualForm.prot) || 0,
      carb: Number(manualForm.carb) || 0,
      grasa: Number(manualForm.grasa) || 0,
    };
    onGuardarDia(hoy(), [...comidas, nuevo]);
    setManualForm({ nombre: "", kcal: "", prot: "", carb: "", grasa: "" });
    setManualAbierto(false);
    setBuscar("");
  }

  async function buscarConIA() {
    if (!buscar.trim()) return;
    setBuscandoIA(true);
    setErrorFoto("");
    try {
      const resultado = await buscarMacrosPorTexto(buscar.trim());
      setManualForm({
        nombre: resultado.nombre || buscar,
        kcal: resultado.kcal ?? "",
        prot: resultado.prot ?? "",
        carb: resultado.carb ?? "",
        grasa: resultado.grasa ?? "",
      });
      setManualAbierto(true);
    } catch (err) {
      setErrorFoto(err.message);
    } finally {
      setBuscandoIA(false);
    }
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
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4">
        <p className="text-xs text-[var(--muted)] mb-3">Tu meta diaria</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Anillo pct={totales.kcal / metas.kcal} color="var(--naranja)" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame size={14} color="var(--naranja)" />
              <p className="text-[11px] font-semibold">{totales.kcal}</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <BarraMacro label="Proteína" valor={totales.prot} meta={metas.prot} color="var(--accent)" />
            <BarraMacro label="Carbos" valor={totales.carb} meta={metas.carb} color="var(--accent)" />
            <BarraMacro label="Grasa" valor={totales.grasa} meta={metas.grasa} color="var(--accent)" />
          </div>
        </div>
        <p className="text-[11px] text-[var(--muted2)] mt-3">
          Meta: {metas.kcal} kcal · {metas.prot}g prot · {metas.carb}g carbs · {metas.grasa}g grasa
        </p>
      </div>

      {metas.pisoAplicado && (
        <div className="bg-[var(--warning-bg)] border border-[var(--warning-40)] rounded-xl p-3.5">
          <p className="text-sm text-[var(--text)] font-medium">
            El cálculo con tus datos dio menos de {metas.pisoSeguridad} kcal, así que usamos ese mínimo en vez del número exacto.
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">
            Revisa que tu peso y altura estén bien ingresados en Perfil. Comer menos de {metas.pisoSeguridad} kcal al día por tiempo prolongado no es seguro sin supervisión de un profesional de la salud.
          </p>
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4">
        <p className="text-xs text-[var(--accent)] font-medium mb-1">Consejo rápido</p>
        <p className="text-sm text-[var(--text)]">{consejo}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[var(--muted)]">Agregar comida</p>
          <button
            onClick={() => inputFotoRef.current?.click()}
            disabled={analizando}
            className="text-xs text-[var(--accent)] flex items-center gap-1 border border-[var(--border)] rounded-full px-2.5 py-1 disabled:opacity-50"
          >
            {analizando ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            {analizando ? "Analizando…" : "Foto de tu comida"}
          </button>
          <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" onChange={elegirFotoComida} className="hidden" />
        </div>
        {errorFoto && <p className="text-xs text-[var(--error)] mb-2">{errorFoto}</p>}
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar: pollo, ceviche, quinoa…"
          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
        {filtrados.length > 0 && (
          <div className="mt-2 space-y-2">
            {filtrados.slice(0, 6).map((a) => (
              <button
                key={a.nombre}
                onClick={() => elegirAlimento(a)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm">{a.nombre}</p>
                  <p className="text-xs text-[var(--muted2)]">
                    Base: {a.gramos}g · {a.kcal} kcal · {a.prot}g prot
                  </p>
                </div>
                <Plus size={16} color="var(--accent)" />
              </button>
            ))}
          </div>
        )}

        {buscar && filtrados.length === 0 && !manualAbierto && (
          <div className="mt-2 space-y-2">
            <button
              onClick={buscarConIA}
              disabled={buscandoIA}
              className="w-full bg-[var(--card)] border border-[var(--accent-40)] rounded-lg px-3 py-2.5 text-left text-sm text-[var(--text)] flex items-center gap-2 disabled:opacity-50"
            >
              {buscandoIA ? <Loader2 size={14} className="animate-spin" color="var(--accent)" /> : <Sparkles size={14} color="var(--accent)" />}
              {buscandoIA ? "Buscando con IA…" : `Buscar "${buscar}" con IA`}
            </button>
            <button
              onClick={() => {
                setManualAbierto(true);
                setManualForm({ ...manualForm, nombre: buscar });
              }}
              className="w-full bg-[var(--card)] border border-dashed border-[var(--border)] rounded-lg px-3 py-2.5 text-left text-sm text-[var(--muted)]"
            >
              O agregar "{buscar}" manualmente
            </button>
          </div>
        )}

        {manualAbierto && (
          <div className="mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg p-3.5 space-y-2.5">
            <input
              value={manualForm.nombre}
              onChange={(e) => setManualForm({ ...manualForm, nombre: e.target.value })}
              placeholder="Nombre del plato"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
            <div className="grid grid-cols-4 gap-2">
              {[
                ["kcal", "Kcal"],
                ["prot", "Prot g"],
                ["carb", "Carb g"],
                ["grasa", "Grasa g"],
              ].map(([campo, label]) => (
                <div key={campo}>
                  <p className="text-[10px] text-[var(--muted2)] mb-1">{label}</p>
                  <input
                    type="number"
                    value={manualForm[campo]}
                    onChange={(e) => setManualForm({ ...manualForm, [campo]: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-[var(--accent)]"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={agregarManual}
                className="flex-1 bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--bg)] text-sm font-semibold rounded-lg py-2"
              >
                Agregar
              </button>
              <button
                onClick={() => setManualAbierto(false)}
                className="px-4 border border-[var(--border)] text-[var(--muted)] text-sm rounded-lg py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {seleccionado && (
          <div className="mt-3 bg-[var(--card)] border border-[var(--border)] rounded-lg p-3.5">
            <p className="text-sm font-medium mb-2">{seleccionado.nombre}</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                autoFocus
                value={gramos}
                onChange={(e) => setGramos(e.target.value)}
                className="w-24 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <span className="text-xs text-[var(--muted)]">gramos</span>
              <button onClick={agregarConGramos} className="ml-auto bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--bg)] text-sm rounded-lg px-4 py-2">
                Agregar
              </button>
            </div>
            {gramos && (
              <p className="text-[11px] text-[var(--muted2)] mt-2">
                ≈ {Math.round(seleccionado.kcal * (Number(gramos) / seleccionado.gramos))} kcal ·{" "}
                {Math.round(seleccionado.prot * (Number(gramos) / seleccionado.gramos) * 10) / 10}g prot
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-[var(--muted)] mb-2">Hoy comiste</p>
        {comidas.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            title="Aún no registras comidas hoy"
            description="Busca un alimento arriba, toma una foto de tu plato o agrégalo manualmente."
          />
        )}
        <div className="space-y-2">
          {comidas.map((c, i) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm">{c.nombre}</p>
                <p className="text-xs text-[var(--muted2)]">
                  {c.kcal} kcal · P {c.prot}g · C {c.carb}g · G {c.grasa}g
                </p>
              </div>
              <button onClick={() => quitarComida(i)}>
                <Trash2 size={15} color="var(--muted2)" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
