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

export const TIEMPOS_DISPONIBLES = [
  { id: 30, label: "30 min" },
  { id: 45, label: "45 min" },
  { id: 60, label: "60+ min" },
];

export const ESTILOS_ENTRENAMIENTO = [
  { id: "mixto", label: "Sin preferencia" },
  { id: "libre", label: "Pesas libres" },
  { id: "maquina", label: "Máquinas" },
  { id: "funcional", label: "Funcional / peso corporal" },
];

// prioridad 1 = movimiento compuesto principal (siempre entra primero)
// prioridad 2 = accesorio secundario (entra con tiempo medio/alto)
// prioridad 3 = aislamiento / finisher (solo entra con tiempo alto)
export const PRIORIDAD_PATRON = {
  press_horizontal: 1,
  press_vertical: 1,
  sentadilla: 1,
  bisagra_cadera: 1,
  remo_horizontal: 1,
  jalon_vertical: 1,
  zancada: 2,
  fondos: 2,
  cardio_funcional: 2,
  gluteo_aislado: 2,
  aislamiento_hombro: 3,
  aislamiento_biceps: 3,
  aislamiento_triceps: 3,
  aislamiento_cuadriceps: 3,
  aislamiento_isquios: 3,
  aislamiento_pecho: 3,
  antebrazo: 3,
  pantorrilla: 3,
  core: 3,
};

export const EJERCICIOS = [
  // ===== EMPUJE =====
  { nombre: "Press banca", grupo: "empuje", patron: "press_horizontal", estilo: "libre", equipo: ["barra", "banco", "discos"], series: 4, reps: "6-8" },
  { nombre: "Press banca con mancuernas", grupo: "empuje", patron: "press_horizontal", estilo: "libre", equipo: ["mancuernas", "banco"], series: 4, reps: "8-10" },
  { nombre: "Press en máquina de pecho", grupo: "empuje", patron: "press_horizontal", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "10-12" },
  { nombre: "Press inclinado con mancuernas", grupo: "empuje", patron: "press_horizontal", estilo: "libre", equipo: ["mancuernas", "banco"], series: 3, reps: "8-10" },
  { nombre: "Flexiones de pecho", grupo: "empuje", patron: "press_horizontal", estilo: "funcional", equipo: [], series: 3, reps: "15-20" },
  { nombre: "Flexiones con déficit (en discos)", grupo: "empuje", patron: "press_horizontal", estilo: "funcional", equipo: ["discos"], series: 3, reps: "12-15" },

  { nombre: "Press militar con barra", grupo: "empuje", patron: "press_vertical", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "6-8" },
  { nombre: "Press militar con mancuernas", grupo: "empuje", patron: "press_vertical", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "8-10" },
  { nombre: "Press de hombro en máquina", grupo: "empuje", patron: "press_vertical", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "10-12" },
  { nombre: "Pike push-up (flexión pica)", grupo: "empuje", patron: "press_vertical", estilo: "funcional", equipo: [], series: 3, reps: "10-12" },

  { nombre: "Fondos en paralelas", grupo: "empuje", patron: "fondos", estilo: "funcional", equipo: [], series: 3, reps: "10-15" },
  { nombre: "Fondos en banco", grupo: "empuje", patron: "fondos", estilo: "funcional", equipo: ["banco"], series: 3, reps: "12-15" },
  { nombre: "Fondos en máquina asistida", grupo: "empuje", patron: "fondos", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "10-12" },

  { nombre: "Aperturas con mancuernas", grupo: "empuje", patron: "aislamiento_pecho", estilo: "libre", equipo: ["mancuernas", "banco"], series: 3, reps: "12-15" },
  { nombre: "Cruce de poleas (pec deck cable)", grupo: "empuje", patron: "aislamiento_pecho", estilo: "maquina", equipo: ["polea"], series: 3, reps: "12-15" },
  { nombre: "Pec deck (máquina contractora)", grupo: "empuje", patron: "aislamiento_pecho", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "12-15" },

  { nombre: "Elevaciones laterales con mancuernas", grupo: "empuje", patron: "aislamiento_hombro", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "12-15" },
  { nombre: "Elevaciones laterales en polea", grupo: "empuje", patron: "aislamiento_hombro", estilo: "maquina", equipo: ["polea"], series: 3, reps: "12-15" },
  { nombre: "Elevación lateral con banda", grupo: "empuje", patron: "aislamiento_hombro", estilo: "funcional", equipo: ["banda"], series: 3, reps: "15-20" },

  { nombre: "Extensión de tríceps con mancuerna", grupo: "empuje", patron: "aislamiento_triceps", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "10-12" },
  { nombre: "Extensión de tríceps en polea (cuerda)", grupo: "empuje", patron: "aislamiento_triceps", estilo: "maquina", equipo: ["polea"], series: 3, reps: "12-15" },
  { nombre: "Fondos entre bancos (tríceps)", grupo: "empuje", patron: "aislamiento_triceps", estilo: "funcional", equipo: ["banco"], series: 3, reps: "12-15" },

  // ===== TIRÓN =====
  { nombre: "Dominadas", grupo: "tiron", patron: "jalon_vertical", estilo: "funcional", equipo: ["barra_dominadas"], series: 4, reps: "6-10" },
  { nombre: "Jalón al pecho en polea (agarre ancho)", grupo: "tiron", patron: "jalon_vertical", estilo: "maquina", equipo: ["polea"], series: 4, reps: "10-12" },
  { nombre: "Jalón al pecho agarre cerrado", grupo: "tiron", patron: "jalon_vertical", estilo: "maquina", equipo: ["polea"], series: 3, reps: "10-12" },
  { nombre: "Jalón con banda elástica", grupo: "tiron", patron: "jalon_vertical", estilo: "funcional", equipo: ["banda"], series: 3, reps: "15" },

  { nombre: "Remo con barra", grupo: "tiron", patron: "remo_horizontal", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "6-8" },
  { nombre: "Remo con mancuerna a una mano", grupo: "tiron", patron: "remo_horizontal", estilo: "libre", equipo: ["mancuernas", "banco"], series: 4, reps: "10-12 c/lado" },
  { nombre: "Remo en máquina (sentado)", grupo: "tiron", patron: "remo_horizontal", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "10-12" },
  { nombre: "Remo en polea baja", grupo: "tiron", patron: "remo_horizontal", estilo: "maquina", equipo: ["polea"], series: 3, reps: "10-12" },
  { nombre: "Remo con banda elástica", grupo: "tiron", patron: "remo_horizontal", estilo: "funcional", equipo: ["banda"], series: 3, reps: "15" },
  { nombre: "Remo invertido en TRX", grupo: "tiron", patron: "remo_horizontal", estilo: "funcional", equipo: ["trx"], series: 3, reps: "12-15" },

  { nombre: "Face pull en polea", grupo: "tiron", patron: "aislamiento_hombro", estilo: "maquina", equipo: ["polea"], series: 3, reps: "15" },

  { nombre: "Curl de bíceps con barra", grupo: "tiron", patron: "aislamiento_biceps", estilo: "libre", equipo: ["barra", "discos"], series: 3, reps: "10-12" },
  { nombre: "Curl de bíceps con mancuernas", grupo: "tiron", patron: "aislamiento_biceps", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "10-12" },
  { nombre: "Curl martillo con mancuernas", grupo: "tiron", patron: "aislamiento_biceps", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "10-12" },
  { nombre: "Curl de bíceps en polea", grupo: "tiron", patron: "aislamiento_biceps", estilo: "maquina", equipo: ["polea"], series: 3, reps: "12-15" },

  { nombre: "Curl de muñeca con mancuernas", grupo: "tiron", patron: "antebrazo", estilo: "libre", equipo: ["mancuernas"], series: 2, reps: "15-20" },

  // ===== PIERNA =====
  { nombre: "Sentadilla con barra (back squat)", grupo: "pierna", patron: "sentadilla", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "6-8" },
  { nombre: "Sentadilla goblet", grupo: "pierna", patron: "sentadilla", estilo: "libre", equipo: ["mancuernas"], series: 4, reps: "10-12" },
  { nombre: "Sentadilla en máquina Smith", grupo: "pierna", patron: "sentadilla", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "8-10" },
  { nombre: "Prensa de pierna (leg press)", grupo: "pierna", patron: "sentadilla", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "10-12" },
  { nombre: "Sentadilla al aire (bodyweight)", grupo: "pierna", patron: "sentadilla", estilo: "funcional", equipo: [], series: 3, reps: "20-25" },

  { nombre: "Peso muerto rumano con barra", grupo: "pierna", patron: "bisagra_cadera", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "8-10" },
  { nombre: "Peso muerto con kettlebell", grupo: "pierna", patron: "bisagra_cadera", estilo: "libre", equipo: ["kettlebell"], series: 3, reps: "10-12" },
  { nombre: "Peso muerto rumano con mancuernas", grupo: "pierna", patron: "bisagra_cadera", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "10-12" },
  { nombre: "Hiperextensión (máquina lumbar)", grupo: "pierna", patron: "bisagra_cadera", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "12-15" },
  { nombre: "Puente de glúteo", grupo: "pierna", patron: "bisagra_cadera", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "15-20" },

  { nombre: "Zancadas con mancuernas", grupo: "pierna", patron: "zancada", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "12 c/pierna" },
  { nombre: "Sentadilla búlgara", grupo: "pierna", patron: "zancada", estilo: "libre", equipo: ["mancuernas", "banco"], series: 3, reps: "10 c/pierna" },
  { nombre: "Zancadas caminando", grupo: "pierna", patron: "zancada", estilo: "funcional", equipo: [], series: 3, reps: "20 pasos" },
  { nombre: "Step-ups con step", grupo: "pierna", patron: "zancada", estilo: "funcional", equipo: ["step"], series: 3, reps: "12 c/pierna" },

  { nombre: "Extensión de cuádriceps en máquina", grupo: "pierna", patron: "aislamiento_cuadriceps", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "12-15" },
  { nombre: "Sentadilla sissy (cuádriceps)", grupo: "pierna", patron: "aislamiento_cuadriceps", estilo: "funcional", equipo: [], series: 3, reps: "12-15" },

  { nombre: "Curl femoral en máquina", grupo: "pierna", patron: "aislamiento_isquios", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "12-15" },
  { nombre: "Peso muerto a una pierna (mancuerna)", grupo: "pierna", patron: "aislamiento_isquios", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "10 c/pierna" },

  { nombre: "Patada de glúteo en polea", grupo: "pierna", patron: "gluteo_aislado", estilo: "maquina", equipo: ["polea"], series: 3, reps: "12-15 c/lado" },
  { nombre: "Hip thrust con barra", grupo: "pierna", patron: "gluteo_aislado", estilo: "libre", equipo: ["barra", "banco", "discos"], series: 4, reps: "10-12" },
  { nombre: "Patada de glúteo (cuadrupedia)", grupo: "pierna", patron: "gluteo_aislado", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "15 c/lado" },

  { nombre: "Elevación de talones de pie", grupo: "pierna", patron: "pantorrilla", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "15-20" },
  { nombre: "Elevación de talones con mancuernas", grupo: "pierna", patron: "pantorrilla", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "15-20" },

  // ===== FULL BODY / CORE / CARDIO =====
  { nombre: "Swing con kettlebell", grupo: "full", patron: "cardio_funcional", estilo: "libre", equipo: ["kettlebell"], series: 4, reps: "15" },
  { nombre: "Burpees", grupo: "full", patron: "cardio_funcional", estilo: "funcional", equipo: [], series: 3, reps: "12" },
  { nombre: "Salto de soga", grupo: "full", patron: "cardio_funcional", estilo: "funcional", equipo: ["soga"], series: 4, reps: "1 min" },
  { nombre: "Bicicleta estática (cardio)", grupo: "full", patron: "cardio_funcional", estilo: "maquina", equipo: ["bici_estatica"], series: 1, reps: "15-20 min" },
  { nombre: "Caminadora (cardio)", grupo: "full", patron: "cardio_funcional", estilo: "maquina", equipo: ["caminadora"], series: 1, reps: "15-20 min" },
  { nombre: "Battle ropes / arrastre con chaleco", grupo: "full", patron: "cardio_funcional", estilo: "funcional", equipo: ["chaleco_peso"], series: 3, reps: "30-40s" },

  { nombre: "Plancha abdominal", grupo: "full", patron: "core", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "40-60s" },
  { nombre: "Rueda abdominal", grupo: "full", patron: "core", estilo: "funcional", equipo: ["rueda_abdominal"], series: 3, reps: "10-12" },
  { nombre: "Crunch en polea (cable)", grupo: "full", patron: "core", estilo: "maquina", equipo: ["polea"], series: 3, reps: "15" },
  { nombre: "Elevación de piernas colgado", grupo: "full", patron: "core", estilo: "funcional", equipo: ["barra_dominadas"], series: 3, reps: "12-15" },
  { nombre: "Deslizamiento de rodillas (discos deslizantes)", grupo: "full", patron: "core", estilo: "funcional", equipo: ["disco_deslizante"], series: 3, reps: "12-15" },
];

export const ALIMENTOS = [
  { nombre: "Pechuga de pollo a la plancha", gramos: 150, kcal: 250, prot: 46, carb: 0, grasa: 6 },
  { nombre: "Lomo saltado", gramos: 350, kcal: 650, prot: 35, carb: 55, grasa: 30 },
  { nombre: "Arroz blanco cocido", gramos: 158, kcal: 205, prot: 4, carb: 45, grasa: 0.4 },
  { nombre: "Ceviche de pescado", gramos: 250, kcal: 280, prot: 32, carb: 20, grasa: 6 },
  { nombre: "Quinoa cocida", gramos: 185, kcal: 220, prot: 8, carb: 39, grasa: 3.5 },
  { nombre: "Camote sancochado", gramos: 130, kcal: 180, prot: 2, carb: 41, grasa: 0.2 },
  { nombre: "Palta", gramos: 100, kcal: 160, prot: 2, carb: 9, grasa: 15 },
  { nombre: "Huevo sancochado", gramos: 50, kcal: 78, prot: 6, carb: 0.6, grasa: 5 },
  { nombre: "Lentejas guisadas", gramos: 200, kcal: 230, prot: 18, carb: 40, grasa: 1 },
  { nombre: "Pescado a la plancha", gramos: 150, kcal: 200, prot: 38, carb: 0, grasa: 5 },
  { nombre: "Pan francés", gramos: 60, kcal: 130, prot: 4, carb: 26, grasa: 1 },
  { nombre: "Papa sancochada", gramos: 150, kcal: 110, prot: 2.5, carb: 26, grasa: 0.1 },
  { nombre: "Causa rellena de pollo", gramos: 300, kcal: 400, prot: 20, carb: 55, grasa: 12 },
  { nombre: "Ají de gallina", gramos: 300, kcal: 520, prot: 30, carb: 45, grasa: 24 },
  { nombre: "Tallarines rojos con pollo", gramos: 350, kcal: 600, prot: 32, carb: 70, grasa: 20 },
  { nombre: "Yogurt griego natural", gramos: 200, kcal: 150, prot: 20, carb: 8, grasa: 4 },
  { nombre: "Plátano", gramos: 118, kcal: 105, prot: 1.3, carb: 27, grasa: 0.4 },
  { nombre: "Menestra de frijoles", gramos: 200, kcal: 225, prot: 15, carb: 40, grasa: 1 },
  { nombre: "Atún en agua", gramos: 120, kcal: 120, prot: 26, carb: 0, grasa: 1 },
  { nombre: "Queso fresco", gramos: 30, kcal: 80, prot: 6, carb: 1, grasa: 6 },
  { nombre: "Choclo", gramos: 150, kcal: 150, prot: 5, carb: 33, grasa: 2 },
  { nombre: "Anticuchos", gramos: 150, kcal: 300, prot: 25, carb: 5, grasa: 20 },
  { nombre: "Ensalada con aceite de oliva", gramos: 150, kcal: 120, prot: 2, carb: 8, grasa: 9 },
  { nombre: "Leche entera", gramos: 250, kcal: 150, prot: 8, carb: 12, grasa: 8 },
  { nombre: "Arroz con pollo", gramos: 350, kcal: 580, prot: 30, carb: 65, grasa: 22 },
  { nombre: "Tacu tacu con lomo", gramos: 350, kcal: 620, prot: 28, carb: 60, grasa: 26 },
  { nombre: "Avena cocida con leche", gramos: 250, kcal: 210, prot: 9, carb: 33, grasa: 5 },
  { nombre: "Pan integral", gramos: 60, kcal: 140, prot: 6, carb: 24, grasa: 2 },
  { nombre: "Mango", gramos: 165, kcal: 100, prot: 1, carb: 25, grasa: 0.5 },
  { nombre: "Almendras", gramos: 30, kcal: 174, prot: 6, carb: 6, grasa: 15 },
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
