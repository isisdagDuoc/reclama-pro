# Decisiones técnicas — Reclama Pro

Registro de las decisiones de arquitectura y diseño tomadas durante el desarrollo, con la justificación de cada una y las alternativas descartadas.

---

## Arquitectura y framework

### Next.js App Router como BFF — sin servidor separado

**Decisión:** las Server Actions y Server Components de Next.js actúan como Backend for Frontend. No existe un servidor Express, una API REST separada ni un microservicio.

**Alternativa descartada:** API REST separada (Express + Next.js como puro cliente).

**Razón:** para el scope de este MVP, agregar un servidor separado duplica la infraestructura sin beneficio real. Next.js App Router permite colocar la lógica de servidor directamente en los archivos de ruta con Server Components y Server Actions. El resultado es menos código, menos puntos de falla y deploy unificado en Vercel.

---

### Estructura de carpetas por rol de ejecución

**Decisión:** `lib/firebase/`, `lib/actions/`, `lib/queries/` (por rol de ejecución) en lugar de `lib/claims/`, `lib/auth/` (por feature).

**Alternativa descartada:** estructura por feature.

**Razón:** la estructura por feature genera ambigüedad cuando las features se solapan. ¿Una query de claims que necesita datos de la empresa va en `lib/claims/` o en `lib/enterprises/`? La estructura por rol de ejecución es siempre clara: si corre en el servidor y lee datos, va en `lib/queries/`. Si muta datos, en `lib/actions/`.

---

## Base de datos

### Firestore con subcolecciones jerárquicas

**Decisión:** `enterprises/{id}/claims/{id}/history/{id}` — subcolecciones anidadas.

**Alternativa descartada:** colecciones planas con campo `enterpriseId` como filtro.

**Razón:** las subcolecciones en Firestore aíslan los datos de cada empresa estructuralmente. No es posible hacer una query que devuelva accidentalmente claims de otro tenant — el path mismo lo impide. Con colecciones planas, una query sin el filtro `where('enterpriseId', '==', id)` devolvería todos los claims del sistema.

---

### `claimCounter` + Transaction para tickets secuenciales

**Decisión:** contador atómico en el documento de empresa, actualizado dentro de una Firestore Transaction junto con la creación del claim.

**Alternativas descartadas:**
- Contar documentos en la colección (`collection.count()`) — no es atómico, puede generar duplicados bajo concurrencia.
- Cloud Functions que generan el número — agrega infraestructura y latencia.
- UUIDs como número de ticket — ilegibles para el usuario final.

**Razón:** la Transaction garantiza que dos claims creados en simultáneo reciban números distintos. El costo es mínimo: una lectura y dos escrituras adicionales por transacción.

---

### Rating en el documento del claim — no en subcolección

**Decisión:** campo `rating: number | null` directamente en `claims/{id}`.

**Alternativa descartada:** subcolección `claims/{id}/ratings/` con un documento por valoración.

**Razón:** cada reclamo tiene exactamente una valoración. Una subcolección agregaría complejidad de consulta sin ningún beneficio. El campo `rating` alimenta directamente el KPI de satisfacción en reportes sin agregaciones adicionales.

---

## Autenticación

### Session Cookies HttpOnly — no localStorage

**Decisión:** la sesión se almacena en una cookie HttpOnly creada con `admin.auth().createSessionCookie()`.

**Alternativa descartada:** guardar el ID Token de Firebase en localStorage y enviarlo en cada request.

**Razón:** las cookies HttpOnly no son accesibles desde JavaScript — mitigan ataques XSS. El ID Token de Firebase dura 1 hora; la session cookie puede durar 7 días con renovación controlada desde el servidor. Además, el BFF puede verificar la cookie en cada request sin depender del cliente para enviar el token.

---

### Credenciales como `FIREBASE_SERVICE_ACCOUNT_JSON` — JSON completo

**Decisión:** una sola variable de entorno con el JSON completo del Service Account.

**Alternativas descartadas:** tres variables separadas (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

**Razón crítica:** Vercel escapa incorrectamente los saltos de línea (`\n`) del `private_key` cuando se configura como variable individual. El resultado es una clave RSA inválida que rompe la autenticación silenciosamente en producción (el error no aparece en desarrollo). Con el JSON completo en una sola variable, el parsing lo hace el código — sin interferencia de Vercel.

---

### `NEXT_PUBLIC_APP_URL` para URLs absolutas del portal

**Decisión:** variable de entorno explícita para la URL base de la app.

**Alternativa descartada:** construir la URL desde `VERCEL_URL` siempre.

**Razón:** `VERCEL_URL` contiene la URL del deployment específico (e.g. `reclama-pro-abc123.vercel.app`), no el alias de producción (`reclama-pro.vercel.app`). Si se usa `VERCEL_URL`, los links del portal generados en producción apuntan a URLs de deployment que cambian en cada deploy. Con `NEXT_PUBLIC_APP_URL` seteada en Vercel para el entorno Production, el link siempre es el correcto.

---

## Frontend

### Portal del cliente accesible solo por token — sin cuenta

**Decisión:** el cliente accede a su reclamo mediante `/{slug}?token={accessToken}`. No hay registro ni login para el cliente.

**Alternativa descartada:** el cliente crea una cuenta y ve todos sus reclamos.

**Razón:** para el MVP, reducir la fricción del cliente es prioritario. Un link directo puede enviarse por WhatsApp, email o SMS. Crear una cuenta agrega un paso de onboarding que muchos clientes abandonarían. La desventaja (el cliente no puede ver todos sus reclamos históricos) es aceptable para el MVP.

---

### Tickets creados solo desde el panel — el portal es solo lectura para creación

**Decisión:** el cliente no puede crear reclamos desde el portal público.

**Alternativa descartada:** formulario público de reclamo en `/{slug}`.

**Razón:** permitir creación pública agrega superficie de ataque (spam, bots, validación de email). El agente actúa como receptor del reclamo (telefónico, presencial, por email) y lo registra en el sistema. Este flujo es coherente con cómo operan la mayoría de las Pymes chilenas que el producto target.

---

### `router.refresh()` para polling — sin Route Handlers adicionales

**Decisión:** componente `<AutoRefresh />` que llama `router.refresh()` cada 20 segundos para actualizar el historial de mensajes.

**Alternativa descartada:** SWR con Route Handlers que devuelvan los datos como JSON.

**Razón:** `router.refresh()` en Next.js App Router fuerza un re-render de los Server Components actuales con datos frescos, sin resetear el estado del cliente (formularios en edición, etc.). Implementar SWR hubiera requerido convertir las páginas a Client Components, crear Route Handlers con autenticación propia, y duplicar la lógica de fetching. Para un intervalo de 20 segundos, `router.refresh()` es suficiente y mantiene la arquitectura de Server Components sin cambios.
