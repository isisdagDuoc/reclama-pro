# Flujos del sistema — Reclama Pro

---

## 1. Flujo por rol de usuario

Reclama Pro tiene tres tipos de usuario con recorridos completamente distintos.

```mermaid
flowchart LR
  subgraph Empresa["🏢 Empresa (Pyme)"]
    admin["👤 Admin"]
    agente["👤 Agente"]
  end

  subgraph Panel["Panel Administrativo"]
    login["Login\n/login"]
    dashboard["Dashboard\n/dashboard"]
    claims["Gestión de reclamos\n/claims"]
    nuevo["Crear reclamo\n/claims/new"]
    detalle["Detalle del reclamo\n/claims/id"]
    reportes["Reportes\n/reports"]
  end

  subgraph Portal["Portal del Cliente"]
    portalView["Vista del reclamo\n/slug?token=..."]
  end

  subgraph ClienteFinal["👤 Cliente Final"]
    cliente["Recibe link por email\no WhatsApp"]
  end

  admin -->|"Se autentica"| login
  agente -->|"Se autentica"| login
  login --> dashboard
  dashboard --> claims
  claims --> nuevo
  nuevo -->|"Genera link único"| detalle
  detalle -->|"Copia link del cliente"| cliente
  claims --> detalle
  dashboard --> reportes

  cliente -->|"Accede sin login"| portalView
  portalView -->|"Comenta / valoración"| detalle
```

---

## 2. Ciclo de vida de un reclamo

Un reclamo sigue un flujo de estados definido. Los botones de acción del panel solo muestran los pasos válidos según el estado actual — no hay dropdown que permita saltar estados.

```mermaid
stateDiagram-v2
  direction LR
  [*] --> open : Agente crea el reclamo

  open --> in_progress : ▶ Iniciar proceso

  in_progress --> resolved : ✓ Marcar como resuelto
  in_progress --> closed   : ✕ Cerrar sin resolver

  resolved --> closed : ✕ Cerrar

  closed --> [*]

  note right of open
    El cliente puede ver el estado
    desde el portal público
  end note

  note right of resolved
    Cliente puede enviar valoración
    1 a 5 estrellas (solo una vez)
  end note
```

---

## 3. Flujo de creación de un reclamo

El reclamo siempre lo crea el agente o admin desde el panel. El cliente no puede crearlo directamente.

```mermaid
sequenceDiagram
  actor Agente
  participant Panel as Panel Next.js
  participant Firestore

  Agente->>Panel: Rellena formulario\n(nombre, email, categoría, descripción)
  Panel->>Firestore: Transaction:\n1. Lee claimCounter de la empresa\n2. Genera ticketNumber (REQ-N)\n3. Crea claim doc con accessToken UUID\n4. Actualiza claimCounter
  Firestore-->>Panel: Claim creado con ID
  Panel-->>Agente: Redirige a /claims/{id}?created=1
  Agente->>Agente: Copia link del cliente\nhttps://app/{slug}?token={accessToken}
  Agente->>Agente: Envía link por email o WhatsApp
```

---

## 4. Flujo de comunicación agente ↔ cliente

Una vez creado el reclamo, agente y cliente pueden intercambiar mensajes. El historial es bidireccional y ambos ven las mismas entradas.

```mermaid
sequenceDiagram
  actor Cliente
  actor Agente
  participant Portal as Portal /slug
  participant Accion as Server Action
  participant Firestore
  participant PanelDetalle as Panel /claims/id

  Cliente->>Portal: Escribe comentario y envía
  Portal->>Accion: addClientComment(enterpriseId, claimId, token, mensaje)
  Accion->>Firestore: Verifica accessToken\nEscribe history entry (authorRole: client)
  Accion->>Accion: revalidatePath("/{slug}")\nrevalidatePath("/claims/{id}")
  Firestore-->>PanelDetalle: Dato fresco en próximo refresh
  PanelDetalle-->>Agente: Ve el mensaje del cliente\n(AutoRefresh cada 20s)

  Agente->>PanelDetalle: Escribe respuesta y envía
  PanelDetalle->>Accion: addReply(claimId, mensaje)
  Accion->>Firestore: Escribe history entry (authorRole: agent)
  Accion->>Accion: revalidatePath("/claims/{id}")\nrevalidatePath("/[slug]", "page")
  Firestore-->>Portal: Dato fresco en próximo refresh
  Portal-->>Cliente: Ve la respuesta del agente\n(AutoRefresh cada 20s)
```

---

## 5. Flujo de autenticación

```mermaid
sequenceDiagram
  actor Usuario
  participant Browser as Browser (Firebase Client)
  participant Servidor as Next.js Server
  participant FirebaseAuth as Firebase Auth

  Usuario->>Browser: Ingresa email y contraseña
  Browser->>FirebaseAuth: signInWithEmailAndPassword()
  FirebaseAuth-->>Browser: ID Token (JWT firmado)
  Browser->>Servidor: Server Action login(idToken)
  Servidor->>FirebaseAuth: verifyIdToken(idToken)
  FirebaseAuth-->>Servidor: Decoded token\n{uid, email, enterpriseId, role}
  Servidor->>FirebaseAuth: createSessionCookie(idToken, 7 días)
  FirebaseAuth-->>Servidor: Session Cookie JWT
  Servidor-->>Browser: Set-Cookie: session (HttpOnly, Secure)
  Browser->>Servidor: GET /dashboard (con cookie)
  Servidor->>FirebaseAuth: verifySessionCookie(cookie)
  FirebaseAuth-->>Servidor: enterpriseId + role válidos
  Servidor-->>Browser: HTML del dashboard
```

---

## 6. Arquitectura técnica por capas

```mermaid
flowchart TB
  subgraph Browser["Navegador"]
    ui["Componentes React\n(Client + Server)"]
    cookie["Cookie de sesión\n(HttpOnly)"]
  end

  subgraph Vercel["Vercel — Next.js Server"]
    proxy["proxy.ts\nProtección de rutas"]
    sc["Server Components\nRenderizado SSR"]
    sa["Server Actions\nMutaciones"]
    queries["lib/queries/\nLecturas Firestore"]
    actions["lib/actions/\nEscrituras Firestore"]
    session["lib/auth/session.ts\nVerificación JWT"]
  end

  subgraph Firebase["Google Firebase"]
    auth["Firebase Auth\nAutenticación y Claims"]
    db["Cloud Firestore\nBase de datos"]
  end

  ui -->|"form action / fetch"| sa
  ui -->|"renderiza"| sc
  sc --> queries
  sa --> actions
  proxy --> session
  session --> auth
  queries --> db
  actions --> db
  cookie --> proxy
```
