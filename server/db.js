const { Pool } = require("pg");

// Railway inyecta DATABASE_URL automáticamente al agregar el plugin de Postgres.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      creado_en TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'usuario';
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre TEXT;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS entrenador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_invitacion TEXT UNIQUE;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'inicial';
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS limite_clientes INTEGER DEFAULT 10;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado_suscripcion TEXT DEFAULT 'activo';

    CREATE TABLE IF NOT EXISTS perfiles (
      usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
      peso NUMERIC,
      altura NUMERIC,
      edad INTEGER,
      sexo TEXT,
      nivel TEXT,
      objetivo TEXT,
      equipo JSONB DEFAULT '[]',
      grasa_pct NUMERIC,
      musculo_pct NUMERIC,
      agua_pct NUMERIC,
      visceral NUMERIC,
      dias_entreno INTEGER DEFAULT 3,
      actualizado_en TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS dias_entreno INTEGER DEFAULT 3;
    ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS tema TEXT DEFAULT 'verde';
    ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS lesiones JSONB DEFAULT '[]';

    CREATE TABLE IF NOT EXISTS entrenamientos (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      lugar TEXT,
      grupo TEXT,
      ejercicios JSONB NOT NULL,
      creado_en TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE entrenamientos ADD COLUMN IF NOT EXISTS duracion_min INTEGER;

    CREATE TABLE IF NOT EXISTS nutricion_dias (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      comidas JSONB NOT NULL DEFAULT '[]',
      UNIQUE(usuario_id, fecha)
    );

    CREATE TABLE IF NOT EXISTS medidas_corporales (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      peso NUMERIC,
      grasa_pct NUMERIC,
      musculo_pct NUMERIC,
      agua_pct NUMERIC,
      visceral NUMERIC,
      creado_en TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE medidas_corporales ADD COLUMN IF NOT EXISTS cintura NUMERIC;
    ALTER TABLE medidas_corporales ADD COLUMN IF NOT EXISTS pecho NUMERIC;
    ALTER TABLE medidas_corporales ADD COLUMN IF NOT EXISTS brazo NUMERIC;
    ALTER TABLE medidas_corporales ADD COLUMN IF NOT EXISTS pierna NUMERIC;
    ALTER TABLE medidas_corporales ADD COLUMN IF NOT EXISTS cadera NUMERIC;
    ALTER TABLE medidas_corporales ADD COLUMN IF NOT EXISTS foto TEXT;

    CREATE TABLE IF NOT EXISTS habitos (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre TEXT NOT NULL,
      emoji TEXT DEFAULT '✅',
      creado_en TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS habito_registros (
      id SERIAL PRIMARY KEY,
      habito_id INTEGER REFERENCES habitos(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      UNIQUE(habito_id, fecha)
    );

    CREATE TABLE IF NOT EXISTS rutinas_favoritas (
      id SERIAL PRIMARY KEY,
      entrenador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre TEXT NOT NULL,
      grupo TEXT NOT NULL,
      ejercicios JSONB NOT NULL,
      creado_en TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS rutinas_asignadas (
      id SERIAL PRIMARY KEY,
      cliente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      grupo TEXT NOT NULL,
      origen TEXT NOT NULL DEFAULT 'ia',
      rutina_favorita_id INTEGER REFERENCES rutinas_favoritas(id) ON DELETE SET NULL,
      ejercicios JSONB NOT NULL,
      asignado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      generado_en TIMESTAMP DEFAULT NOW(),
      UNIQUE(cliente_id, grupo)
    );

    CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      entrenador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      cliente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      remitente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      contenido TEXT NOT NULL,
      leido BOOLEAN DEFAULT FALSE,
      creado_en TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS push_subscripciones (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      creado_en TIMESTAMP DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initSchema };
