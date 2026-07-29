import { useState, useRef } from "react";
import { Camera, Plus, X, Trash2 } from "lucide-react";
import { registrarMedida, borrarMedida } from "../api";
import { fechaLegible, hoy } from "../data";

function redimensionarImagen(archivo, anchoMax = 900, calidad = 0.72) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, anchoMax / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * escala;
        canvas.height = img.height * escala;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", calidad));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

export default function SeguidorMedidas({ medidas, onMedidaGuardada }) {
  const [abierto, setAbierto] = useState(false);
  const [foto, setFoto] = useState(null);
  const [form, setForm] = useState({ peso: "", cintura: "", pecho: "", brazo: "", pierna: "", cadera: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const inputFotoRef = useRef(null);

  async function elegirFoto(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    try {
      const dataUrl = await redimensionarImagen(archivo);
      setFoto(dataUrl);
    } catch {
      setError("No se pudo procesar la foto");
    }
  }

  async function guardar() {
    setGuardando(true);
    setError("");
    try {
      await registrarMedida({
        fecha: hoy(),
        peso: form.peso ? Number(form.peso) : null,
        cintura: form.cintura ? Number(form.cintura) : null,
        pecho: form.pecho ? Number(form.pecho) : null,
        brazo: form.brazo ? Number(form.brazo) : null,
        pierna: form.pierna ? Number(form.pierna) : null,
        cadera: form.cadera ? Number(form.cadera) : null,
        foto,
      });
      setForm({ peso: "", cintura: "", pecho: "", brazo: "", pierna: "", cadera: "" });
      setFoto(null);
      setAbierto(false);
      onMedidaGuardada();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id) {
    await borrarMedida(id);
    onMedidaGuardada();
  }

  const conFoto = [...(medidas || [])].reverse().filter((m) => m.foto);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#8B96A3]">Tu seguimiento con fotos</p>
        <button
          onClick={() => setAbierto(!abierto)}
          className="text-xs text-[#C9A227] flex items-center gap-1 border border-[#2F3A47] rounded-full px-2.5 py-1"
        >
          {abierto ? <X size={12} /> : <Plus size={12} />} {abierto ? "Cerrar" : "Nueva medición"}
        </button>
      </div>

      {abierto && (
        <div className="bg-[#1A2028] border border-[#263140] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.35)] p-4 mb-3 space-y-3">
          <button
            onClick={() => inputFotoRef.current?.click()}
            className="w-full aspect-[4/3] bg-[#0F1318] border border-dashed border-[#2F3A47] rounded-lg flex items-center justify-center overflow-hidden"
          >
            {foto ? (
              <img src={foto} alt="Vista previa" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-[#6B7684]">
                <Camera size={22} />
                <span className="text-xs">Tomar o subir foto</span>
              </div>
            )}
          </button>
          <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" onChange={elegirFoto} className="hidden" />

          <div className="grid grid-cols-3 gap-2">
            {[
              ["peso", "Peso kg"],
              ["cintura", "Cintura cm"],
              ["pecho", "Pecho cm"],
              ["brazo", "Brazo cm"],
              ["pierna", "Pierna cm"],
              ["cadera", "Cadera cm"],
            ].map(([campo, label]) => (
              <div key={campo}>
                <p className="text-[10px] text-[#6B7684] mb-1">{label}</p>
                <input
                  type="number"
                  value={form[campo]}
                  onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                  className="w-full bg-[#0F1318] border border-[#2F3A47] rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-[#C9A227]"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-[#E2828C]">{error}</p>}

          <button
            onClick={guardar}
            disabled={guardando}
            className="w-full bg-[#A32638] disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-semibold"
          >
            {guardando ? "Guardando…" : "Guardar medición"}
          </button>
        </div>
      )}

      {conFoto.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {conFoto.map((m) => (
            <div key={m.id} className="shrink-0 w-32">
              <div className="relative">
                <img src={m.foto} alt={fechaLegible(m.fecha)} className="w-32 h-40 object-cover rounded-lg border border-[#263140]" />
                <button
                  onClick={() => eliminar(m.id)}
                  className="absolute top-1 right-1 bg-[#0F1318]/80 rounded-full p-1"
                >
                  <Trash2 size={11} color="#E2828C" />
                </button>
              </div>
              <p className="text-[10px] text-[#6B7684] mt-1">{fechaLegible(m.fecha)}</p>
              {m.peso && <p className="text-[10px] text-[#8B96A3]">{m.peso}kg{m.cintura ? ` · cintura ${m.cintura}cm` : ""}</p>}
            </div>
          ))}
        </div>
      ) : (
        !abierto && <p className="text-xs text-[#6B7684] bg-[#1A2028] rounded-xl p-4">Aún no tienes fotos de seguimiento.</p>
      )}
    </div>
  );
}
