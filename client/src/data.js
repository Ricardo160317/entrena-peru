export const EQUIPO_OPCIONES = [
  { id: "mancuernas", label: "Mancuernas" },
  { id: "barra", label: "Barra" },
  { id: "discos", label: "Discos" },
  { id: "banco", label: "Banco" },
  { id: "polea", label: "Polea / cable" },
  { id: "maquina", label: "Máquina / prensa" },
  { id: "banda", label: "Banda elástica" },
  { id: "kettlebell", label: "Kettlebell" },
  { id: "barra_dominadas", label: "Barra de dominadas" },
  { id: "colchoneta", label: "Colchoneta" },
  { id: "trx", label: "TRX / bandas de suspensión" },
  { id: "step", label: "Step / cajón pliométrico" },
  { id: "soga", label: "Soga para saltar" },
  { id: "rueda_abdominal", label: "Rueda abdominal" },
  { id: "rodillo_espuma", label: "Rodillo de espuma" },
  { id: "chaleco_peso", label: "Chaleco con peso" },
  { id: "disco_deslizante", label: "Discos deslizantes" },
  { id: "bici_estatica", label: "Bicicleta estática" },
  { id: "caminadora", label: "Caminadora / trotadora" },
];

export const TODO_EQUIPO = EQUIPO_OPCIONES.map((e) => e.id);

export const GRUPOS = [
  { id: "empuje", label: "Empuje", sub: "Pecho · hombro · tríceps" },
  { id: "tiron", label: "Tirón", sub: "Espalda · bíceps" },
  { id: "pierna", label: "Pierna", sub: "Cuádriceps · glúteo · isquios" },
  { id: "full", label: "Full body", sub: "Cuerpo completo / cardio" },
];

export const EJERCICIOS = [
  { nombre: "Sentadilla con barra", grupo: "pierna", equipo: ["barra", "discos"], series: 4, reps: "8-10" },
  { nombre: "Sentadilla goblet", grupo: "pierna", equipo: ["mancuernas"], series: 4, reps: "10-12" },
  { nombre: "Peso muerto rumano", grupo: "pierna", equipo: ["barra", "discos"], series: 4, reps: "8-10" },
  { nombre: "Zancadas con mancuernas", grupo: "pierna", equipo: ["mancuernas"], series: 3, reps: "12 c/pierna" },
  { nombre: "Prensa de pierna", grupo: "pierna", equipo: ["maquina"], series: 4, reps: "10-12" },
  { nombre: "Puente de glúteo", grupo: "pierna", equipo: ["colchoneta"], series: 3, reps: "15" },
  { nombre: "Sentadilla búlgara", grupo: "pierna", equipo: ["mancuernas", "banco"], series: 3, reps: "10 c/pierna" },
  { nombre: "Press banca", grupo: "empuje", equipo: ["barra", "banco", "discos"], series: 4, reps: "8-10" },
  { nombre: "Press banca con mancuernas", grupo: "empuje", equipo: ["mancuernas", "banco"], series: 4, reps: "8-10" },
  { nombre: "Press militar", grupo: "empuje", equipo: ["barra", "discos"], series: 3, reps: "8-10" },
  { nombre: "Press militar con mancuernas", grupo: "empuje", equipo: ["mancuernas"], series: 3, reps: "10" },
  { nombre: "Fondos en banco", grupo: "empuje", equipo: ["banco"], series: 3, reps: "12-15" },
  { nombre: "Flexiones de pecho", grupo: "empuje", equipo: [], series: 3, reps: "15-20" },
  { nombre: "Extensión de tríceps con mancuerna", grupo: "empuje", equipo: ["mancuernas"], series: 3, reps: "12" },
  { nombre: "Elevaciones laterales", grupo: "empuje", equipo: ["mancuernas"], series: 3, reps: "12-15" },
  { nombre: "Jalón al pecho en polea", grupo: "tiron", equipo: ["polea"], series: 4, reps: "10-12" },
  { nombre: "Remo con barra", grupo: "tiron", equipo: ["barra", "discos"], series: 4, reps: "8-10" },
  { nombre: "Remo con mancuerna a una mano", grupo: "tiron", equipo: ["mancuernas", "banco"], series: 3, reps: "10-12 c/lado" },
  { nombre: "Dominadas", grupo: "tiron", equipo: ["barra_dominadas"], series: 3, reps: "al fallo" },
  { nombre: "Curl de bíceps con mancuernas", grupo: "tiron", equipo: ["mancuernas"], series: 3, reps: "12" },
  { nombre: "Remo con banda elástica", grupo: "tiron", equipo: ["banda"], series: 3, reps: "15" },
  { nombre: "Peso muerto con kettlebell", grupo: "full", equipo: ["kettlebell"], series: 3, reps: "12" },
  { nombre: "Swing con kettlebell", grupo: "full", equipo: ["kettlebell"], series: 4, reps: "15" },
  { nombre: "Plancha abdominal", grupo: "full", equipo: ["colchoneta"], series: 3, reps: "40s" },
  { nombre: "Burpees", grupo: "full", equipo: [], series: 3, reps: "12" },
  { nombre: "Zancadas caminando", grupo: "full", equipo: [], series: 3, reps: "20 pasos" },
];

export const ALIMENTOS = [
  { nombre: "Pechuga de pollo a la plancha (150g)", kcal: 250, prot: 46, carb: 0, grasa: 6 },
  { nombre: "Lomo saltado (1 plato)", kcal: 650, prot: 35, carb: 55, grasa: 30 },
  { nombre: "Arroz blanco (1 taza)", kcal: 205, prot: 4, carb: 45, grasa: 0.4 },
  { nombre: "Ceviche de pescado (1 porción)", kcal: 280, prot: 32, carb: 20, grasa: 6 },
  { nombre: "Quinoa cocida (1 taza)", kcal: 220, prot: 8, carb: 39, grasa: 3.5 },
  { nombre: "Camote sancochado (1 mediano)", kcal: 180, prot: 2, carb: 41, grasa: 0.2 },
  { nombre: "Palta (1/2 unidad)", kcal: 120, prot: 1.5, carb: 6, grasa: 11 },
  { nombre: "Huevo sancochado (1 unidad)", kcal: 78, prot: 6, carb: 0.6, grasa: 5 },
  { nombre: "Lentejas guisadas (1 taza)", kcal: 230, prot: 18, carb: 40, grasa: 1 },
  { nombre: "Pescado a la plancha (150g)", kcal: 200, prot: 38, carb: 0, grasa: 5 },
  { nombre: "Pan francés (1 unidad)", kcal: 130, prot: 4, carb: 26, grasa: 1 },
  { nombre: "Papa sancochada (1 mediana)", kcal: 110, prot: 2.5, carb: 26, grasa: 0.1 },
  { nombre: "Causa rellena de pollo (1 porción)", kcal: 400, prot: 20, carb: 55, grasa: 12 },
  { nombre: "Ají de gallina (1 plato)", kcal: 520, prot: 30, carb: 45, grasa: 24 },
  { nombre: "Tallarines rojos con pollo (1 plato)", kcal: 600, prot: 32, carb: 70, grasa: 20 },
  { nombre: "Yogurt griego natural (1 taza)", kcal: 150, prot: 20, carb: 8, grasa: 4 },
  { nombre: "Plátano (1 unidad)", kcal: 105, prot: 1.3, carb: 27, grasa: 0.4 },
  { nombre: "Menestra de frijoles (1 taza)", kcal: 225, prot: 15, carb: 40, grasa: 1 },
  { nombre: "Atún en agua (1 lata)", kcal: 120, prot: 26, carb: 0, grasa: 1 },
  { nombre: "Queso fresco (30g)", kcal: 80, prot: 6, carb: 1, grasa: 6 },
  { nombre: "Choclo (1 unidad mediana)", kcal: 150, prot: 5, carb: 33, grasa: 2 },
  { nombre: "Anticuchos (3 palitos)", kcal: 300, prot: 25, carb: 5, grasa: 20 },
  { nombre: "Ensalada con aceite de oliva", kcal: 120, prot: 2, carb: 8, grasa: 9 },
  { nombre: "Leche entera (1 vaso)", kcal: 150, prot: 8, carb: 12, grasa: 8 },
];

export const NIVEL_ACTIVIDAD = [
  { id: "sedentario", label: "Sedentario (poco o nada de ejercicio)", factor: 1.2 },
  { id: "ligero", label: "Ligero (1-3 días/semana)", factor: 1.375 },
  { id: "moderado", label: "Moderado (3-5 días/semana)", factor: 1.55 },
  { id: "activo", label: "Activo (6-7 días/semana)", factor: 1.725 },
  { id: "muy_activo", label: "Muy activo (entreno intenso diario)", factor: 1.9 },
];

export const OBJETIVOS = [
  { id: "bajar", label: "Bajar grasa", factor: 0.8 },
  { id: "mantener", label: "Mantener", factor: 1 },
  { id: "subir", label: "Ganar músculo", factor: 1.15 },
];

export function calcularMacros(perfil) {
  if (!perfil) return null;
  const { peso, altura, edad, sexo, nivel, objetivo } = perfil;
  const bmr =
    sexo === "M" ? 10 * peso + 6.25 * altura - 5 * edad + 5 : 10 * peso + 6.25 * altura - 5 * edad - 161;
  const factorActividad = NIVEL_ACTIVIDAD.find((n) => n.id === nivel)?.factor || 1.2;
  const factorObjetivo = OBJETIVOS.find((o) => o.id === objetivo)?.factor || 1;
  const kcal = Math.round(bmr * factorActividad * factorObjetivo);
  const prot = Math.round(peso * 2);
  const grasa = Math.round(peso * 0.8);
  const kcalRestantes = kcal - prot * 4 - grasa * 9;
  const carb = Math.max(0, Math.round(kcalRestantes / 4));
  return { kcal, prot, carb, grasa };
}

export const hoy = () => new Date().toISOString().slice(0, 10);
export const fechaLegible = (iso) => {
  const soloFecha = String(iso).slice(0, 10);
  return new Date(soloFecha + "T00:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short" });
};
