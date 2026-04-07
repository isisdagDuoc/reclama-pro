# Guía de inicio — Reclama Pro

Esta guía explica cómo configurar el entorno local desde cero.

---

## Requisitos previos

Asegúrate de tener instalado:

| Herramienta | Versión mínima | Verificar con |
|-------------|---------------|---------------|
| Node.js | 18.x o superior | `node -v` |
| npm | 9.x o superior | `npm -v` |
| Git | cualquiera | `git -v` |

También necesitarás una cuenta en [Firebase Console](https://console.firebase.google.com) con acceso al proyecto **reclama-pro**.

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd reclama-pro
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar Firebase

### 3.1 Obtener el Service Account

1. Ve a [Firebase Console](https://console.firebase.google.com) → proyecto **reclama-pro**
2. Haz clic en el ícono de engranaje → **Configuración del proyecto**
3. Pestaña **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Se descarga un archivo `.json` — guárdalo en un lugar seguro (nunca lo subas a Git)

### 3.2 Crear el archivo `.env.local`

Copia el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

Luego abre el archivo `.json` descargado con un editor de texto, copia **todo el contenido** y pégalo en `.env.local`:

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"reclama-pro",...}
```

> El JSON debe quedar en **una sola línea**, sin saltos de línea.

**En PowerShell** puedes hacerlo automáticamente:

```powershell
$json = Get-Content "C:\ruta\al\archivo-descargado.json" -Raw -Encoding UTF8
$json = $json -replace "`r`n", "" -replace "`n", "" -replace "`r", ""
"FIREBASE_SERVICE_ACCOUNT_JSON=$json" | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline
```

> **Importante:** el archivo debe llamarse exactamente `.env.local` (con el punto al inicio). Si lo nombras `env.local`, Next.js no lo leerá.

---

## 4. Correr el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

Si Firebase está configurado correctamente, verás en la consola de VSC:

```
[firebase-admin] App initialized for project: reclama-pro
```

---

## 5. Verificar la configuración

Para confirmar que Firebase Admin funciona, puedes crear temporalmente una ruta de test:

**`src/app/api/test-firebase/route.ts`**
```typescript
import { getDb } from '@/lib/firebase/admin';

export async function GET() {
  const db = getDb();
  return Response.json({ ok: true, projectId: db.projectId });
}
```

Luego visita [http://localhost:3000/api/test-firebase](http://localhost:3000/api/test-firebase). Deberías ver:

```json
{ "ok": true, "projectId": "reclama-pro" }
```

Elimina ese archivo una vez verificado.

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Build de producción |
| `npm run lint` | Análisis de código con ESLint |

---

## Solución de problemas comunes

**`Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable`**
→ El archivo `.env.local` no existe o está mal nombrado. Verifica que tenga el punto al inicio.

**`Firebase App named '[DEFAULT]' already exists`**
→ No debería ocurrir con el singleton implementado. Si aparece, reinicia el servidor de desarrollo.

**`Cannot find module 'firebase-admin'`**
→ Corre `npm install` nuevamente.

---

← Volver al [README](./README.md)
