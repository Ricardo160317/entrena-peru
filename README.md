# NEX-FIT

App de entrenamiento y nutrición con cuentas de usuario, control de pesos, asesor con IA (ChatGPT) y seguimiento de balanza corporal.

## Stack
- **Frontend**: React + Vite + Tailwind
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL (persistente — tu información no se pierde)
- **IA**: OpenAI (ChatGPT) para el asesor conversacional

## 1. Subir el repositorio a GitHub

```bash
cd entrena-peru
git init
git add .
git commit -m "Primera versión de NEX-FIT"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/entrena-peru.git
git push -u origin main
```

(Crea antes el repo vacío en https://github.com/new — sin README, para no chocar con este.)

## 2. Desplegar en Railway

1. Entra a https://railway.app y crea un proyecto nuevo → **Deploy from GitHub repo** → elige `entrena-peru`.
2. En el mismo proyecto, click **+ New** → **Database** → **Add PostgreSQL**. Railway crea automáticamente la variable `DATABASE_URL` y la conecta a tu servicio.
3. En el servicio de la app, ve a **Variables** y agrega:
   - `JWT_SECRET` → genera uno con `openssl rand -hex 32` (o cualquier cadena larga y aleatoria)
   - `OPENAI_API_KEY` → tu llave de https://platform.openai.com/api-keys
   - `OPENAI_MODEL` → `gpt-4o-mini` (recomendado por costo) o el modelo que prefieras
   - `ACCESS_CODE` → una palabra o frase secreta; solo quien la tenga podrá crear una cuenta (déjalo vacío si no lo necesitas)
4. Railway detecta el `package.json` raíz y usa `railway.json` para el build (`npm run build`) y el arranque (`npm start`). No necesitas configurar nada más.
5. Cuando termine el deploy, Railway te da una URL pública (`algo.up.railway.app`). Esa es tu app.

## 3. Primer uso

Entra a la URL, click en "Regístrate", pon el `ACCESS_CODE` si lo configuraste, y crea tu cuenta. Desde ahí tu información (perfil, rutinas, comidas, medidas de balanza) queda guardada en la base de datos — puedes entrar desde el celular, la laptop, donde sea, con el mismo email y contraseña.

## Notas sobre vender / compartir la app

- Cada usuario que se registre tiene sus propios datos aislados (no se mezclan entre cuentas).
- Antes de compartirla con otras personas, deberías agregar unos Términos de Uso y una Política de Privacidad — maneja datos de salud (peso, % de grasa, comidas), y eso tiene requisitos legales en la mayoría de países, incluido Perú.
- El costo de OpenAI corre por tu cuenta como dueño de la app (todas las consultas del asesor usan tu misma `OPENAI_API_KEY`). Si la app crece, conviene poner límites de uso por usuario o un plan de pago.
- **Pendiente para una siguiente fase**: análisis de fotos corporales con IA. Es viable (OpenAI y otros proveedores tienen modelos con visión), pero requiere guardar imágenes en algún storage (ej. Cloudflare R2, AWS S3) y sumar más consideraciones de privacidad al ser fotos del cuerpo. Se puede construir cuando quieras avanzar a esa fase.

## Desarrollo local

```bash
# Backend
cd server
cp ../.env.example .env   # y completa los valores
npm install
npm start

# Frontend (en otra terminal)
cd client
npm install
npm run dev
```

Necesitas Postgres corriendo localmente (o usa la `DATABASE_URL` de Railway apuntando a producción, con cuidado).
