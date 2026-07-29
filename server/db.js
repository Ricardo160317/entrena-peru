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

    CREATE TABLE IF NOT EXISTS entrenamientos (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      fecha DATE NOT NULL,
      lugar TEXT,
      grupo TEXT,
      ejercicios JSONB NOT NULL,
      creado_en TIMESTAMP DEFAULT NOW()
    );

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
  `);
}

module.exports = { pool, initSchema };
