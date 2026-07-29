import { useEffect, useState } from "react";
import { Dumbbell, TrendingUp, Salad, UserCircle2, MessageCircleHeart, CheckSquare, Home as HomeIcon } from "lucide-react";
import {
  getToken,
  clearToken,
  obtenerPerfil,
  guardarPerfil as apiGuardarPerfil,
  obtenerEntrenamientos,
  crearEntrenamiento,
  obtenerNutricion,
  guardarDiaNutricion,
  obtenerMedidas,
} from "./api";
import { hoy } from "./data";
import Auth from "./components/Auth";
import Onboarding from "./components/Onboarding";
import Entrenar from "./components/Entrenar";
import Progreso from "./components/Progreso";
import Nutricion from "./components/Nutricion";
import Asesor from "./components/Asesor";
import Habitos from "./components/Habitos";
import Inicio from "./components/Inicio";
import PerfilTab from "./components/PerfilTab";

export default function App() {
  const [autenticado, setAutenticado] = useState(!!getToken());
  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [nutricion, setNutricion] = useState([]);
  const [medidas, setMedidas] = useState([]);
  const [tab, setTab] = useState("inicio");

  useEffect(() => {
    if (!autenticado) {
      setCargando(false);
      return;
    }
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  async function cargarTodo() {
    setCargando(true);
    try {
      const [p, e, n, m] = await Promise.all([
        obtenerPerfil(),
        obtenerEntrenamientos(),
        obtenerNutricion(),
        obtenerMedidas(),
      ]);
      setPerfil(p);
      setEntrenamientos(e);
      setNutricion(n);
      setMedidas(m);
    } catch (err) {
      if (err.message === "Sesión inválida o expirada" || err.message === "No autenticado") {
        clearToken();
        setAutenticado(false);
      }
    } finally {
      setCargando(false);
    }
  }

  async function guardarPerfil(nuevo) {
    const actualizado = await apiGuardarPerfil(nuevo);
    setPerfil(actualizado);
    obtenerMedidas().then(setMedidas);
  }

  async function guardarSesionEntrenamiento(sesion) {
    const guardada = await crearEntrenamiento(sesion);
    setEntrenamientos([...entrenamientos, guardada]);
  }

  async function refrescarMedidas() {
    const m = await obtenerMedidas();
    setMedidas(m);
  }

  async function guardarDiaNutricionLocal(fecha, comidas) {
    const guardado = await guardarDiaNutricion(fecha, comidas);
    const otros = nutricion.filter((d) => d.fecha.slice(0, 10) !== fecha);
    setNutricion([...otros, guardado]);
  }

  if (!autenticado) {
    return <Auth onAutenticado={() => setAutenticado(true)} />;
  }

  if (cargando) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-[#FFFFFF]">
        <div className="text-[#6B7280] text-sm animate-pulse">Cargando tu progreso…</div>
      </div>
    );
  }

  if (!perfil) {
    return <Onboarding onGuardar={guardarPerfil} />;
  }

  const diaHoy = nutricion.find((d) => d.fecha.slice(0, 10) === hoy()) || { fecha: hoy(), comidas: [] };

  return (
    <div className="min-h-[700px] bg-[#FFFFFF] text-[#111827] font-sans flex flex-col max-w-md mx-auto relative">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs tracking-[0.2em] uppercase text-[#15803D]">Entrena Perú</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">
          {tab === "inicio" && "Hola de nuevo"}
          {tab === "entrenar" && "Tu rutina de hoy"}
          {tab === "progreso" && "Tu progreso"}
          {tab === "nutricion" && "Asesor de macros"}
          {tab === "asesor" && "Pregúntale al asesor"}
          {tab === "habitos" && "Tus hábitos"}
          {tab === "perfil" && "Tu perfil"}
        </h1>
      </header>

      <main className="flex-1 px-5 pb-24 overflow-y-auto">
        {tab === "inicio" && <Inicio entrenamientos={entrenamientos} />}
        {tab === "entrenar" && (
          <Entrenar perfil={perfil} entrenamientos={entrenamientos} onGuardarSesion={guardarSesionEntrenamiento} />
        )}
        {tab === "progreso" && <Progreso entrenamientos={entrenamientos} medidas={medidas} onMedidaGuardada={refrescarMedidas} />}
        {tab === "nutricion" && (
          <Nutricion perfil={perfil} diaHoy={diaHoy} onGuardarDia={guardarDiaNutricionLocal} />
        )}
        {tab === "asesor" && <Asesor />}
        {tab === "habitos" && <Habitos />}
        {tab === "perfil" && (
          <PerfilTab
            perfil={perfil}
            onGuardarPerfil={guardarPerfil}
            onCerrarSesion={() => {
              clearToken();
              setAutenticado(false);
              setPerfil(null);
            }}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#F8FAFC] border-t border-[#E5E7EB] flex justify-around py-2">
        <NavBtn icon={HomeIcon} label="Inicio" active={tab === "inicio"} onClick={() => setTab("inicio")} />
        <NavBtn icon={Dumbbell} label="Entrenar" active={tab === "entrenar"} onClick={() => setTab("entrenar")} />
        <NavBtn icon={TrendingUp} label="Progreso" active={tab === "progreso"} onClick={() => setTab("progreso")} />
        <NavBtn icon={Salad} label="Nutrición" active={tab === "nutricion"} onClick={() => setTab("nutricion")} />
        <NavBtn icon={MessageCircleHeart} label="Asesor" active={tab === "asesor"} onClick={() => setTab("asesor")} />
        <NavBtn icon={CheckSquare} label="Hábitos" active={tab === "habitos"} onClick={() => setTab("habitos")} />
        <NavBtn icon={UserCircle2} label="Perfil" active={tab === "perfil"} onClick={() => setTab("perfil")} />
      </nav>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-0.5 py-1">
      <Icon size={16} color={active ? "#111827" : "#9CA3AF"} />
      <span className={`text-[7.5px] font-medium ${active ? "text-[#111827]" : "text-[#9CA3AF]"}`}>{label}</span>
    </button>
  );
}
