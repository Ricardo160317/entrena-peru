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
  { id: "abdomen", label: "Abdomen", sub: "Core · abdominales" },
  { id: "full", label: "Cardio / Full body", sub: "Cuerpo completo · cardio" },
  { id: "superior", label: "Tren Superior", sub: "Pecho, espalda, hombro y brazos" },
  { id: "inferior", label: "Tren Inferior", sub: "Pierna, glúteo y abdomen" },
  { id: "gluteo", label: "Glúteo y Pierna (tonificación)", sub: "Enfoque en glúteo, isquios y pierna" },
];

// Combina varios grupos base en uno solo (para splits tren superior/inferior o enfoques específicos)
export const SUBGRUPOS_COMBINADOS = {
  superior: ["empuje", "tiron"],
  inferior: ["pierna", "abdomen"],
};

export const CALENTAMIENTO = {
  empuje: [
    "3-5 min de cardio ligero (soga, caminadora o trote suave)",
    "Círculos de brazos y hombros, 15 c/lado",
    "Flexiones de pecho suaves, 1-2 series de 10 sin peso",
  ],
  tiron: [
    "3-5 min de cardio ligero",
    "Círculos de brazos y rotación de hombros, 15 c/lado",
    "Jalones o remo con banda ligera, 1-2 series de 12",
  ],
  pierna: [
    "3-5 min de cardio ligero (bici o caminadora)",
    "Sentadillas al aire, 2 series de 12",
    "Zancadas suaves sin peso, 10 c/pierna",
    "Movilidad de cadera y tobillo, 30s por lado",
  ],
  abdomen: [
    "2-3 min de cardio ligero",
    "Rotación de tronco de pie, 15 c/lado",
    "Plancha suave, 20s para activar el core",
  ],
  full: [
    "3-5 min de cardio ligero, subiendo de intensidad",
    "Movilidad general: círculos de cadera, hombro y tobillo",
    "1 serie corta del primer ejercicio a baja intensidad",
  ],
  superior: [
    "3-5 min de cardio ligero (soga o caminadora)",
    "Círculos de brazos y rotación de hombros, 15 c/lado",
    "Flexiones o remo con banda ligera, 1-2 series de 10-12",
  ],
  inferior: [
    "3-5 min de cardio ligero (bici o caminadora)",
    "Sentadillas al aire, 2 series de 12",
    "Puente de glúteo sin peso, 12-15 reps",
    "Movilidad de cadera y tobillo, 30s por lado",
  ],
  gluteo: [
    "3-5 min de cardio ligero",
    "Puente de glúteo con banda, 15 reps",
    "Sentadillas al aire con pausa arriba, 12 reps",
    "Activación con banda en las rodillas (monster walk), 10 pasos c/lado",
  ],
};

export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const NOMBRE_DIA_GRUPO = {
  empuje: "Pecho, Hombro y Tríceps",
  tiron: "Espalda y Bíceps",
  pierna: "Pierna y Glúteo",
  abdomen: "Abdomen",
  full: "Cardio y Full Body",
  superior: "Tren Superior",
  inferior: "Tren Inferior",
  gluteo: "Glúteo y Pierna (tonificación)",
};

// Según cuántos días a la semana entrena la persona, arma un split recomendado (empieza en lunes).
// Devuelve un array de 7 posiciones (domingo=0 ... sábado=6), con el grupo del día o null (descanso).
export function armarPlanSemanal(diasPorSemana) {
  // Cada array tiene 7 posiciones en orden Lunes..Domingo (null = descanso).
  // Diseñados para nunca poner dos días de tren superior (empuje/tirón) seguidos,
  // alternando con pierna/abdomen/descanso entre medio.
  const planesLunesADomingo = {
    1: [null, null, "full", null, null, null, null],
    2: ["full", null, null, "full", null, null, null],
    3: ["empuje", null, "pierna", null, "tiron", null, null],
    4: ["empuje", null, "pierna", null, "tiron", "abdomen", null],
    5: ["empuje", "pierna", null, "tiron", "abdomen", "full", null],
    6: ["empuje", "pierna", "tiron", "empuje", "pierna", "tiron", null],
    7: ["empuje", "pierna", "tiron", "abdomen", "empuje", "pierna", "tiron"],
  };
  const planLunesADomingo = planesLunesADomingo[diasPorSemana] || planesLunesADomingo[3];
  // Reordenar a domingo=0 ... sábado=6, como usa el resto de la app
  const plan = [null, null, null, null, null, null, null];
  const ordenLunesADomingo = [1, 2, 3, 4, 5, 6, 0];
  ordenLunesADomingo.forEach((diaIndex, i) => {
    plan[diaIndex] = planLunesADomingo[i];
  });
  return plan;
}

export const CONSEJOS_DESCANSO = [
  "Estira 10 minutos los músculos que trabajaste ayer — mejora la recuperación y la movilidad.",
  "Camina 20-30 minutos a paso ligero. El descanso activo ayuda a recuperar sin agregar fatiga.",
  "Prioriza el sueño hoy — es cuando más se repara el músculo que entrenaste esta semana.",
  "Hidrátate bien y prioriza proteína en tus comidas de hoy para apoyar la recuperación.",
  "Usa un rodillo de espuma o haz automasaje en las zonas más cargadas de la semana.",
];

export const LESIONES_OPCIONES = [
  { id: "rodilla", label: "Rodilla" },
  { id: "hombro", label: "Hombro" },
  { id: "espalda_baja", label: "Espalda baja" },
  { id: "muñeca", label: "Muñeca" },
  { id: "cadera", label: "Cadera" },
  { id: "tobillo", label: "Tobillo / pie" },
];

export const DIAS_ENTRENO_OPCIONES = [1, 2, 3, 4, 5, 6, 7];

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
  gluteo_aislado: 2,
  cardio_constante: 1,
  hiit_funcional: 2,
  core_isometrico: 1,
  core_flexion: 2,
  core_piernas: 2,
  core_rotacion: 3,
  core_flexion_avanzada: 3,
  aislamiento_hombro: 3,
  aislamiento_biceps: 3,
  aislamiento_triceps: 3,
  aislamiento_cuadriceps: 3,
  aislamiento_isquios: 3,
  aislamiento_pecho: 3,
  antebrazo: 3,
  pantorrilla: 3,
  gluteo_activacion: 3,
};

export const EJERCICIOS = [
  // ===== EMPUJE =====
  { nombre: "Press banca", grupo: "empuje", patron: "press_horizontal", estilo: "libre", equipo: ["barra", "banco", "discos"], series: 4, reps: "6-8", evitar_si: ["hombro"] },
  { nombre: "Press banca con mancuernas", grupo: "empuje", patron: "press_horizontal", estilo: "libre", equipo: ["mancuernas", "banco"], series: 4, reps: "8-10", evitar_si: ["hombro"] },
  { nombre: "Press en máquina de pecho", grupo: "empuje", patron: "press_horizontal", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "10-12" },
  { nombre: "Press inclinado con mancuernas", grupo: "empuje", patron: "press_horizontal", estilo: "libre", equipo: ["mancuernas", "banco"], series: 3, reps: "8-10", evitar_si: ["hombro"] },
  { nombre: "Flexiones de pecho", grupo: "empuje", patron: "press_horizontal", estilo: "funcional", equipo: [], series: 3, reps: "15-20", evitar_si: ["muñeca"] },
  { nombre: "Flexiones con déficit (en discos)", grupo: "empuje", patron: "press_horizontal", estilo: "funcional", equipo: ["discos"], series: 3, reps: "12-15", evitar_si: ["muñeca"] },

  { nombre: "Press militar con barra", grupo: "empuje", patron: "press_vertical", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "6-8", evitar_si: ["hombro"] },
  { nombre: "Press militar con mancuernas", grupo: "empuje", patron: "press_vertical", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "8-10", evitar_si: ["hombro"] },
  { nombre: "Press de hombro en máquina", grupo: "empuje", patron: "press_vertical", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "10-12", evitar_si: ["hombro"] },
  { nombre: "Pike push-up (flexión pica)", grupo: "empuje", patron: "press_vertical", estilo: "funcional", equipo: [], series: 3, reps: "10-12", evitar_si: ["hombro"] },

  { nombre: "Fondos en paralelas", grupo: "empuje", patron: "fondos", estilo: "funcional", equipo: [], series: 3, reps: "10-15", evitar_si: ["hombro"] },
  { nombre: "Fondos en banco", grupo: "empuje", patron: "fondos", estilo: "funcional", equipo: ["banco"], series: 3, reps: "12-15", evitar_si: ["hombro", "muñeca"] },
  { nombre: "Fondos en máquina asistida", grupo: "empuje", patron: "fondos", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "10-12", evitar_si: ["hombro"] },

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
  { nombre: "Dominadas", grupo: "tiron", patron: "jalon_vertical", estilo: "funcional", equipo: ["barra_dominadas"], series: 4, reps: "6-10", evitar_si: ["hombro"] },
  { nombre: "Jalón al pecho en polea (agarre ancho)", grupo: "tiron", patron: "jalon_vertical", estilo: "maquina", equipo: ["polea"], series: 4, reps: "10-12" },
  { nombre: "Jalón al pecho agarre cerrado", grupo: "tiron", patron: "jalon_vertical", estilo: "maquina", equipo: ["polea"], series: 3, reps: "10-12" },
  { nombre: "Jalón con banda elástica", grupo: "tiron", patron: "jalon_vertical", estilo: "funcional", equipo: ["banda"], series: 3, reps: "15" },

  { nombre: "Remo con barra", grupo: "tiron", patron: "remo_horizontal", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "6-8", evitar_si: ["espalda_baja"] },
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

  { nombre: "Curl de muñeca con mancuernas", grupo: "tiron", patron: "antebrazo", estilo: "libre", equipo: ["mancuernas"], series: 2, reps: "15-20", evitar_si: ["muñeca"] },

  // ===== PIERNA =====
  { nombre: "Sentadilla con barra (back squat)", grupo: "pierna", patron: "sentadilla", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "6-8", evitar_si: ["rodilla"] },
  { nombre: "Sentadilla goblet", grupo: "pierna", patron: "sentadilla", estilo: "libre", equipo: ["mancuernas"], series: 4, reps: "10-12" },
  { nombre: "Sentadilla en máquina Smith", grupo: "pierna", patron: "sentadilla", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "8-10", evitar_si: ["rodilla"] },
  { nombre: "Prensa de pierna (leg press)", grupo: "pierna", patron: "sentadilla", estilo: "maquina", equipo: ["maquina"], series: 4, reps: "10-12", evitar_si: ["rodilla"] },
  { nombre: "Sentadilla al aire (bodyweight)", grupo: "pierna", patron: "sentadilla", estilo: "funcional", equipo: [], series: 3, reps: "20-25" },

  { nombre: "Peso muerto rumano con barra", grupo: "pierna", patron: "bisagra_cadera", estilo: "libre", equipo: ["barra", "discos"], series: 4, reps: "8-10", evitar_si: ["espalda_baja"] },
  { nombre: "Peso muerto con kettlebell", grupo: "pierna", patron: "bisagra_cadera", estilo: "libre", equipo: ["kettlebell"], series: 3, reps: "10-12", evitar_si: ["espalda_baja"] },
  { nombre: "Peso muerto rumano con mancuernas", grupo: "pierna", patron: "bisagra_cadera", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "10-12", evitar_si: ["espalda_baja"] },
  { nombre: "Hiperextensión (máquina lumbar)", grupo: "pierna", patron: "bisagra_cadera", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "12-15" },
  { nombre: "Puente de glúteo", grupo: "pierna", patron: "bisagra_cadera", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "15-20" },

  { nombre: "Zancadas con mancuernas", grupo: "pierna", patron: "zancada", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "12 c/pierna", evitar_si: ["rodilla"] },
  { nombre: "Sentadilla búlgara", grupo: "pierna", patron: "zancada", estilo: "libre", equipo: ["mancuernas", "banco"], series: 3, reps: "10 c/pierna", evitar_si: ["rodilla"] },
  { nombre: "Zancadas caminando", grupo: "pierna", patron: "zancada", estilo: "funcional", equipo: [], series: 3, reps: "20 pasos", evitar_si: ["rodilla", "tobillo"] },
  { nombre: "Step-ups con step", grupo: "pierna", patron: "zancada", estilo: "funcional", equipo: ["step"], series: 3, reps: "12 c/pierna", evitar_si: ["rodilla", "tobillo"] },

  { nombre: "Extensión de cuádriceps en máquina", grupo: "pierna", patron: "aislamiento_cuadriceps", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "12-15", evitar_si: ["rodilla"] },
  { nombre: "Sentadilla sissy (cuádriceps)", grupo: "pierna", patron: "aislamiento_cuadriceps", estilo: "funcional", equipo: [], series: 3, reps: "12-15", evitar_si: ["rodilla"] },

  { nombre: "Curl femoral en máquina", grupo: "pierna", patron: "aislamiento_isquios", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "12-15" },
  { nombre: "Peso muerto a una pierna (mancuerna)", grupo: "pierna", patron: "aislamiento_isquios", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "10 c/pierna", evitar_si: ["espalda_baja"] },

  { nombre: "Patada de glúteo en polea", grupo: "pierna", patron: "gluteo_aislado", estilo: "maquina", equipo: ["polea"], series: 3, reps: "12-15 c/lado" },
  { nombre: "Hip thrust con barra", grupo: "pierna", patron: "gluteo_aislado", estilo: "libre", equipo: ["barra", "banco", "discos"], series: 4, reps: "10-12", evitar_si: ["espalda_baja"] },
  { nombre: "Patada de glúteo (cuadrupedia)", grupo: "pierna", patron: "gluteo_aislado", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "15 c/lado" },

  { nombre: "Elevación de talones de pie", grupo: "pierna", patron: "pantorrilla", estilo: "maquina", equipo: ["maquina"], series: 3, reps: "15-20" },
  { nombre: "Elevación de talones con mancuernas", grupo: "pierna", patron: "pantorrilla", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "15-20" },

  // ===== CARDIO / FULL BODY =====
  { nombre: "Swing con kettlebell", grupo: "full", patron: "cardio_constante", estilo: "libre", equipo: ["kettlebell"], series: 4, reps: "15" },
  { nombre: "Salto de soga", grupo: "full", patron: "cardio_constante", estilo: "funcional", equipo: ["soga"], series: 4, reps: "1 min", evitar_si: ["tobillo"] },
  { nombre: "Bicicleta estática (cardio)", grupo: "full", patron: "cardio_constante", estilo: "maquina", equipo: ["bici_estatica"], series: 1, reps: "15-20 min" },
  { nombre: "Caminadora (cardio)", grupo: "full", patron: "cardio_constante", estilo: "maquina", equipo: ["caminadora"], series: 1, reps: "15-20 min" },

  { nombre: "Burpees", grupo: "full", patron: "hiit_funcional", estilo: "funcional", equipo: [], series: 3, reps: "12", evitar_si: ["muñeca", "tobillo"] },
  { nombre: "Mountain climbers", grupo: "full", patron: "hiit_funcional", estilo: "funcional", equipo: [], series: 3, reps: "30s", evitar_si: ["muñeca"] },
  { nombre: "Jumping jacks", grupo: "full", patron: "hiit_funcional", estilo: "funcional", equipo: [], series: 3, reps: "40s" },
  { nombre: "Sentadilla con salto", grupo: "full", patron: "hiit_funcional", estilo: "funcional", equipo: [], series: 3, reps: "12", evitar_si: ["rodilla", "tobillo"] },
  { nombre: "Battle ropes / arrastre con chaleco", grupo: "full", patron: "hiit_funcional", estilo: "funcional", equipo: ["chaleco_peso"], series: 3, reps: "30-40s" },

  // ===== ABDOMEN =====
  { nombre: "Plancha abdominal", grupo: "abdomen", patron: "core_isometrico", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "40-60s", evitar_si: ["muñeca"] },
  { nombre: "Plancha lateral", grupo: "abdomen", patron: "core_isometrico", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "30-40s c/lado", evitar_si: ["muñeca"] },
  { nombre: "Plancha con toque de hombro", grupo: "abdomen", patron: "core_isometrico", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "16 toques" },

  { nombre: "Crunch abdominal en colchoneta", grupo: "abdomen", patron: "core_flexion", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "15-20" },
  { nombre: "Crunch en polea (cable)", grupo: "abdomen", patron: "core_flexion", estilo: "maquina", equipo: ["polea"], series: 3, reps: "15" },

  { nombre: "Rueda abdominal", grupo: "abdomen", patron: "core_flexion_avanzada", estilo: "funcional", equipo: ["rueda_abdominal"], series: 3, reps: "10-12", evitar_si: ["muñeca"] },
  { nombre: "Deslizamiento de rodillas (discos deslizantes)", grupo: "abdomen", patron: "core_flexion_avanzada", estilo: "funcional", equipo: ["disco_deslizante"], series: 3, reps: "12-15" },

  { nombre: "Elevación de piernas colgado", grupo: "abdomen", patron: "core_piernas", estilo: "funcional", equipo: ["barra_dominadas"], series: 3, reps: "12-15", evitar_si: ["hombro"] },
  { nombre: "Elevación de rodillas colgado", grupo: "abdomen", patron: "core_piernas", estilo: "funcional", equipo: ["barra_dominadas"], series: 3, reps: "12-15", evitar_si: ["hombro"] },
  { nombre: "Elevación de piernas en banco", grupo: "abdomen", patron: "core_piernas", estilo: "funcional", equipo: ["banco"], series: 3, reps: "12-15" },

  { nombre: "Bicicleta abdominal", grupo: "abdomen", patron: "core_rotacion", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "20 c/lado", evitar_si: ["cadera"] },
  { nombre: "Giro ruso con disco o mancuerna", grupo: "abdomen", patron: "core_rotacion", estilo: "libre", equipo: ["discos"], series: 3, reps: "15 c/lado", evitar_si: ["espalda_baja"] },

  // ===== GLÚTEO Y PIERNA (TONIFICACIÓN) =====
  { nombre: "Puente de glúteo con banda", grupo: "gluteo", patron: "bisagra_cadera", estilo: "funcional", equipo: ["banda", "colchoneta"], series: 3, reps: "15-20" },
  { nombre: "Hip thrust con barra", grupo: "gluteo", patron: "bisagra_cadera", estilo: "libre", equipo: ["barra", "banco", "discos"], series: 4, reps: "12-15", evitar_si: ["espalda_baja"] },
  { nombre: "Peso muerto rumano con mancuernas", grupo: "gluteo", patron: "bisagra_cadera", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "12-15", evitar_si: ["espalda_baja"] },
  { nombre: "Patada de glúteo en polea", grupo: "gluteo", patron: "gluteo_aislado", estilo: "maquina", equipo: ["polea"], series: 3, reps: "15 c/lado" },
  { nombre: "Patada de glúteo a cuadrupedia", grupo: "gluteo", patron: "gluteo_aislado", estilo: "funcional", equipo: ["colchoneta"], series: 3, reps: "15-20 c/lado" },
  { nombre: "Sentadilla sumo con mancuerna", grupo: "gluteo", patron: "sentadilla", estilo: "libre", equipo: ["mancuernas"], series: 3, reps: "15", evitar_si: ["rodilla"] },
  { nombre: "Zancada lateral", grupo: "gluteo", patron: "zancada", estilo: "funcional", equipo: [], series: 3, reps: "12 c/pierna", evitar_si: ["rodilla"] },
  { nombre: "Abducción de cadera con banda", grupo: "gluteo", patron: "gluteo_activacion", estilo: "funcional", equipo: ["banda"], series: 3, reps: "15-20" },
  { nombre: "Caminata lateral con banda (monster walk)", grupo: "gluteo", patron: "gluteo_activacion", estilo: "funcional", equipo: ["banda"], series: 3, reps: "10 pasos c/lado" },
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
  { nombre: "Scoop de proteína en polvo (whey)", gramos: 30, kcal: 120, prot: 24, carb: 3, grasa: 1.5 },
  { nombre: "Batido de proteína con leche", gramos: 300, kcal: 270, prot: 32, carb: 15, grasa: 6 },
  { nombre: "Batido de proteína con agua", gramos: 300, kcal: 130, prot: 25, carb: 4, grasa: 2 },
  { nombre: "Barra proteica", gramos: 60, kcal: 220, prot: 20, carb: 22, grasa: 8 },
  { nombre: "Claras de huevo líquidas", gramos: 100, kcal: 52, prot: 11, carb: 0.7, grasa: 0.2 },
  { nombre: "Requesón / cottage cheese", gramos: 150, kcal: 145, prot: 18, carb: 5, grasa: 5 },
  { nombre: "Avena en hojuelas (cruda)", gramos: 50, kcal: 190, prot: 7, carb: 32, grasa: 3.5 },
  { nombre: "Mantequilla de maní", gramos: 30, kcal: 190, prot: 7, carb: 6, grasa: 16 },
  { nombre: "Tostadas integrales", gramos: 30, kcal: 80, prot: 3, carb: 15, grasa: 1 },
  { nombre: "Pechuga de pavo a la plancha", gramos: 150, kcal: 165, prot: 34, carb: 0, grasa: 2 },
  { nombre: "Salmón a la plancha", gramos: 150, kcal: 280, prot: 34, carb: 0, grasa: 15 },
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
  const pesoNum = Number(peso);
  const alturaNum = Number(altura);
  const edadNum = Number(edad);
  const bmr =
    sexo === "M"
      ? 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum + 5
      : 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum - 161;
  const factorActividad = NIVEL_ACTIVIDAD.find((n) => n.id === nivel)?.factor || 1.2;
  const factorObjetivo = OBJETIVOS.find((o) => o.id === objetivo)?.factor || 1;
  let kcal = Math.round(bmr * factorActividad * factorObjetivo);

  // Piso de seguridad: nunca sugerir menos de lo que organismos de nutrición consideran un mínimo
  // razonable sin supervisión profesional. Si el cálculo cae debajo, se avisa en vez de aplicarlo ciego.
  const pisoSeguridad = sexo === "M" ? 1500 : 1200;
  const pisoAplicado = kcal < pisoSeguridad;
  if (pisoAplicado) kcal = pisoSeguridad;

  const prot = Math.round(pesoNum * 2);
  const grasa = Math.round(pesoNum * 0.8);
  const kcalRestantes = kcal - prot * 4 - grasa * 9;
  const carb = Math.max(0, Math.round(kcalRestantes / 4));
  return { kcal, prot, carb, grasa, pisoAplicado, pisoSeguridad };
}

export const TIPS_DIARIOS = [
  { categoria: "Fitness", texto: "La técnica correcta con menos peso siempre gana a más peso con mala forma. Prioriza el control del movimiento." },
  { categoria: "Alimentación", texto: "La proteína en cada comida ayuda a mantenerte saciado y a preservar músculo, entrenes o no ese día." },
  { categoria: "Superación", texto: "El progreso no es lineal. Una semana floja no borra las anteriores — lo que importa es volver a empezar." },
  { categoria: "Fitness", texto: "El descanso entre series importa tanto como el ejercicio: 60-90s en aislamiento, 2-3 min en compuestos pesados." },
  { categoria: "Alimentación", texto: "Tomar agua antes de cada comida ayuda a regular el apetito y es un hábito simple de sostener." },
  { categoria: "Superación", texto: "No necesitas motivación todos los días, necesitas un sistema. Los hábitos sostienen cuando la motivación falta." },
  { categoria: "Fitness", texto: "El calentamiento no es opcional: reduce el riesgo de lesión y mejora tu rendimiento en la sesión." },
  { categoria: "Alimentación", texto: "Comer variado (proteínas, carbos, grasas, vegetales) es más sostenible a largo plazo que restringir grupos enteros." },
  { categoria: "Superación", texto: "Divide la meta grande en la acción de hoy. '30 min de ejercicio hoy' es más manejable que 'ponerme en forma'." },
  { categoria: "Fitness", texto: "El sueño es parte del entrenamiento: la recuperación muscular ocurre mientras descansas, no solo en el gimnasio." },
  { categoria: "Alimentación", texto: "No hay alimentos 'prohibidos' en una dieta balanceada, hay cantidades y frecuencia. Todo entra con moderación." },
  { categoria: "Superación", texto: "Escribe lo que lograste hoy, aunque sea pequeño. Ver el progreso escrito ayuda a sostener el hábito." },
];

export function tipDelDia() {
  const diaDelAño = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return TIPS_DIARIOS[diaDelAño % TIPS_DIARIOS.length];
}

export const TEMAS_COLOR = [
  { id: "verde", label: "Verde (oscuro)", color: "#C8FF3D" },
  { id: "morado", label: "Morado (oscuro)", color: "#C4B5FD" },
  { id: "azul", label: "Azul (oscuro)", color: "#7DD3FC" },
  { id: "turquesa", label: "Turquesa (oscuro)", color: "#5EEAD4" },
  { id: "naranja", label: "Naranja (oscuro)", color: "#FDBA74" },
  { id: "rosa", label: "Rosa (oscuro)", color: "#F9A8D4" },
  { id: "dorado", label: "Dorado (oscuro)", color: "#FCD34D" },
  { id: "claro", label: "Claro", color: "#FFFFFF", borde: true },
];

export const hoy = () => new Date().toISOString().slice(0, 10);
export const fechaLegible = (iso) => {
  const soloFecha = String(iso).slice(0, 10);
  return new Date(soloFecha + "T00:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short" });
};
