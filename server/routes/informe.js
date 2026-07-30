const express = require("express");
const PDFDocument = require("pdfkit");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const NOMBRE_GRUPO = {
  empuje: "Pecho, Hombro y Tríceps",
  tiron: "Espalda y Bíceps",
  pierna: "Pierna y Glúteo",
  abdomen: "Abdomen",
  full: "Cardio y Full Body",
};

const NIVEL_FACTOR = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muy_activo: 1.9 };
const OBJETIVO_FACTOR = { bajar: 0.8, mantener: 1, subir: 1.15 };

function calcularMetaKcal(perfil) {
  if (!perfil || !perfil.peso || !perfil.altura || !perfil.edad) return null;
  const bmr =
    perfil.sexo === "M"
      ? 10 * perfil.peso + 6.25 * perfil.altura - 5 * perfil.edad + 5
      : 10 * perfil.peso + 6.25 * perfil.altura - 5 * perfil.edad - 161;
  const factorAct = NIVEL_FACTOR[perfil.nivel] || 1.2;
  const factorObj = OBJETIVO_FACTOR[perfil.objetivo] || 1;
  let kcal = Math.round(bmr * factorAct * factorObj);
  const piso = perfil.sexo === "M" ? 1500 : 1200;
  if (kcal < piso) kcal = piso;
  return kcal;
}

function fechaEs(fecha) {
  return new Date(String(fecha).slice(0, 10) + "T00:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

router.get("/pdf", async (req, res) => {
  const dias = Number(req.query.dias) || 60;
  const clienteIdParam = req.query.clienteId ? Number(req.query.clienteId) : null;

  let usuarioObjetivoId = req.usuarioId;

  if (clienteIdParam && clienteIdParam !== req.usuarioId) {
    const rol = await pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.usuarioId]);
    if (rol.rows[0]?.rol !== "entrenador") {
      return res.status(403).json({ error: "No autorizado" });
    }
    const esCliente = await pool.query("SELECT id FROM usuarios WHERE id = $1 AND entrenador_id = $2", [
      clienteIdParam,
      req.usuarioId,
    ]);
    if (esCliente.rows.length === 0) {
      return res.status(403).json({ error: "Ese usuario no es tu cliente" });
    }
    usuarioObjetivoId = clienteIdParam;
  }

  try {
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    const desdeStr = desde.toISOString().slice(0, 10);

    const [usuarioR, perfilR, medidasR, entrenamientosR, nutricionR, habitosR] = await Promise.all([
      pool.query("SELECT email, creado_en FROM usuarios WHERE id = $1", [usuarioObjetivoId]),
      pool.query("SELECT * FROM perfiles WHERE usuario_id = $1", [usuarioObjetivoId]),
      pool.query(
        "SELECT fecha, peso, grasa_pct, musculo_pct, agua_pct, visceral, cintura, pecho, brazo, pierna, cadera FROM medidas_corporales WHERE usuario_id = $1 AND fecha >= $2 ORDER BY fecha ASC",
        [usuarioObjetivoId, desdeStr]
      ),
      pool.query(
        "SELECT fecha, grupo, lugar, ejercicios, duracion_min FROM entrenamientos WHERE usuario_id = $1 AND fecha >= $2 ORDER BY fecha ASC",
        [usuarioObjetivoId, desdeStr]
      ),
      pool.query(
        "SELECT fecha, comidas FROM nutricion_dias WHERE usuario_id = $1 AND fecha >= $2 ORDER BY fecha ASC",
        [usuarioObjetivoId, desdeStr]
      ),
      pool.query(
        `SELECT h.nombre, h.emoji, COUNT(r.id) AS dias_cumplidos
         FROM habitos h LEFT JOIN habito_registros r ON r.habito_id = h.id AND r.fecha >= $2
         WHERE h.usuario_id = $1 GROUP BY h.id, h.nombre, h.emoji`,
        [usuarioObjetivoId, desdeStr]
      ),
    ]);

    const usuario = usuarioR.rows[0];
    const perfil = perfilR.rows[0];
    const metaKcal = calcularMetaKcal(perfil);

    const doc = new PDFDocument({ margin: 45, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="informe-entrena-peru.pdf"`);
    doc.pipe(res);

    // ---- Encabezado ----
    doc.fontSize(20).fillColor("#111827").text("Informe de progreso", { align: "left" });
    doc.fontSize(10).fillColor("#6B7280").text(`NEX-FIT · ${usuario?.email || ""}`);
    doc.text(`Período: últimos ${dias} días · Generado el ${fechaEs(new Date().toISOString())}`);
    doc.moveDown(1);

    // ---- Perfil ----
    doc.fontSize(13).fillColor("#111827").text("Perfil");
    doc.fontSize(10).fillColor("#374151");
    if (perfil) {
      doc.text(`Peso: ${perfil.peso ?? "-"} kg   Altura: ${perfil.altura ?? "-"} cm   Edad: ${perfil.edad ?? "-"}`);
      doc.text(`Objetivo: ${perfil.objetivo ?? "-"}   Nivel de actividad: ${perfil.nivel ?? "-"}   Días de entreno/semana: ${perfil.dias_entreno ?? "-"}`);
      if (metaKcal) doc.text(`Meta calórica diaria estimada: ${metaKcal} kcal`);
    } else {
      doc.text("Sin datos de perfil registrados aún.");
    }
    doc.moveDown(1);

    // ---- Medidas corporales ----
    doc.fontSize(13).fillColor("#111827").text("Medidas corporales");
    doc.fontSize(9).fillColor("#374151");
    if (medidasR.rows.length === 0) {
      doc.text("Sin mediciones registradas en este período.");
    } else {
      medidasR.rows.forEach((m) => {
        const partes = [`${fechaEs(m.fecha)}:`];
        if (m.peso) partes.push(`${m.peso}kg`);
        if (m.grasa_pct) partes.push(`grasa ${m.grasa_pct}%`);
        if (m.musculo_pct) partes.push(`músculo ${m.musculo_pct}%`);
        if (m.agua_pct) partes.push(`agua ${m.agua_pct}%`);
        if (m.cintura) partes.push(`cintura ${m.cintura}cm`);
        if (m.pecho) partes.push(`pecho ${m.pecho}cm`);
        if (m.brazo) partes.push(`brazo ${m.brazo}cm`);
        if (m.pierna) partes.push(`pierna ${m.pierna}cm`);
        if (m.cadera) partes.push(`cadera ${m.cadera}cm`);
        doc.text(partes.join("  ·  "));
      });
      if (medidasR.rows.length >= 2) {
        const primero = medidasR.rows[0];
        const ultimo = medidasR.rows[medidasR.rows.length - 1];
        if (primero.peso && ultimo.peso) {
          const diff = (ultimo.peso - primero.peso).toFixed(1);
          doc.moveDown(0.3);
          doc.fillColor("#111827").text(`Cambio de peso en el período: ${diff > 0 ? "+" : ""}${diff} kg`);
        }
      }
    }
    doc.moveDown(1);

    // ---- Asistencia ----
    doc.fontSize(13).fillColor("#111827").text("Asistencia a entrenamientos");
    doc.fontSize(9).fillColor("#374151");
    doc.text(`Sesiones registradas en el período: ${entrenamientosR.rows.length}`);
    const mejoresPorEjercicio = {};
    entrenamientosR.rows.forEach((s) => {
      doc.text(
        `${fechaEs(s.fecha)} — ${NOMBRE_GRUPO[s.grupo] || s.grupo} (${s.lugar === "casa" ? "Casa" : "Gimnasio"})${s.duracion_min ? ` · ${s.duracion_min} min` : ""}`
      );
      (s.ejercicios || []).forEach((ej) => {
        const pesos = Array.isArray(ej.series) ? ej.series.map((x) => x.peso).filter(Boolean) : ej.peso ? [ej.peso] : [];
        if (pesos.length === 0) return;
        const top = Math.max(...pesos);
        if (!mejoresPorEjercicio[ej.nombre] || top > mejoresPorEjercicio[ej.nombre]) {
          mejoresPorEjercicio[ej.nombre] = top;
        }
      });
    });
    doc.moveDown(1);

    if (Object.keys(mejoresPorEjercicio).length > 0) {
      doc.fontSize(13).fillColor("#111827").text("Mejores marcas del período");
      doc.fontSize(9).fillColor("#374151");
      Object.entries(mejoresPorEjercicio).forEach(([nombre, peso]) => {
        doc.text(`${nombre}: ${peso} kg`);
      });
      doc.moveDown(1);
    }

    // ---- Nutrición ----
    doc.fontSize(13).fillColor("#111827").text("Nutrición diaria");
    doc.fontSize(9).fillColor("#374151");
    if (nutricionR.rows.length === 0) {
      doc.text("Sin comidas registradas en este período.");
    } else {
      let sumaKcal = 0;
      nutricionR.rows.forEach((d) => {
        const totales = (d.comidas || []).reduce(
          (acc, c) => ({
            kcal: acc.kcal + (c.kcal || 0),
            prot: acc.prot + (c.prot || 0),
            carb: acc.carb + (c.carb || 0),
            grasa: acc.grasa + (c.grasa || 0),
          }),
          { kcal: 0, prot: 0, carb: 0, grasa: 0 }
        );
        sumaKcal += totales.kcal;
        doc.text(
          `${fechaEs(d.fecha)}: ${Math.round(totales.kcal)} kcal · P ${Math.round(totales.prot)}g · C ${Math.round(totales.carb)}g · G ${Math.round(totales.grasa)}g`
        );
      });
      doc.moveDown(0.3);
      doc.fillColor("#111827").text(`Promedio diario del período: ${Math.round(sumaKcal / nutricionR.rows.length)} kcal`);
    }
    doc.moveDown(1);

    // ---- Hábitos ----
    if (habitosR.rows.length > 0) {
      doc.fontSize(13).fillColor("#111827").text("Hábitos");
      doc.fontSize(9).fillColor("#374151");
      habitosR.rows.forEach((h) => {
        doc.text(`${h.emoji} ${h.nombre}: cumplido ${h.dias_cumplidos} de ${dias} días`);
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo generar el informe" });
  }
});

module.exports = router;
