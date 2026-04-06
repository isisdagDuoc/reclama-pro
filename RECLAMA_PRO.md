
## Justificación de Negocio

### Objetivo:
Desarrollar una plataforma web escalable para la gestión de tickets 
de reclamos que permita a las Pymes nacionales centralizar y dar 
trazabilidad a los requerimientos de sus clientes finales de manera 
eficiente. 

### Objetivos específicos 
Analizar los requisitos funcionales y no funcionales del sistema de 
gestión de tickets para asegurar que la solución resuelva el 
problema. Diseñar una arquitectura de software basada en un 
modelo de capas que garantice la escalabilidad, la seguridad de los 
datos relacionales y alta disponibilidad del servicio para las 
empresas futuras.  

Implementar un sistema de autentificación y perfiles diferenciados 
(Usuario, Pyme, Administrador) para el control de acceso y gestión 
de roles. Construir un panel de control interactivo que visualice el 
flujo de estados de los tickets (pendientes, en proceso y resueltos) 
en tiempo real. Validar el funcionamiento del MVP mediante 
pruebas de usuario para asegurar que la interfaz sea intuitiva para 
dueños de los negocios no técnicos.

## Stack Tencologico 

SDK: firebase-admin
Typescript
Next JS 
Node
SWR o React Query
Despliegue en Vercel
eslint

## Arquitectura

BFF 
Cliente

## Definiciones técnicas 

SWR o React Query (El estándar de Next.js)
Es la opción más "limpia" para un BFF. El cliente no sabe que existe Firebase; solo conoce tus APIs de Next.js.

Cómo funciona: Usas una librería como SWR (de Vercel) o TanStack Query. Estas librerías hacen "polling" inteligente o revalidación por foco.

Configuración: Puedes configurar que cada 30 segundos o cada vez que el usuario cambie de pestaña, Next.js pregunte al servidor si el estado del reclamo cambió.

Pros: Mantienes toda la lógica en el servidor (BFF puro).

Cons: No es tiempo real "puro" (hay un pequeño retraso de segundos).

## Flujo de la APP

### Explicación de los nodos clave:
Validar Session Cookie (BFF): A diferencia de una app de cliente pura, aquí el servidor de Next.js intercepta la petición. Si el usuario no tiene la cookie de sesión de la empresa, ni siquiera llega a tocar Firebase.

- Filtrar por EnterpriseID: Este es el punto crítico de seguridad. El BFF inyecta automáticamente el ID de la empresa en la consulta de Firestore para que un agente de la "Empresa A" nunca pueda ver (ni por error) reclamos de la "Empresa B".

- SWR Revalidate / Mutate: Cuando el agente cambia un estado (por ejemplo, de "Pendiente" a "En Revisión"), usamos la función mutate de SWR. Esto hace que la lista se actualice en la pantalla del agente sin recargar la página, dando una sensación de aplicación nativa.

- Server Action: Es la forma moderna de Next.js de manejar formularios y escrituras. Es una función que corre exclusivamente en el servidor, manteniendo tus credenciales de Firebase Admin totalmente ocultas del navegador.

# Estructura de Base de Datos - CRM de Reclamos

## Colección Raíz: `enterprises`
Documento: `{enterpriseId}` (ID único de la empresa)

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `name` | string | Nombre comercial de la empresa. |
| `slug` | string | Identificador para URL (ej: 'logistica-abc'). |
| `plan` | string | Nivel de suscripción (basic, pro, enterprise). |
| `createdAt` | timestamp | Fecha de registro de la empresa. |

---

### Subcolección: `enterprises/{enterpriseId}/users`
Documentos de empleados con acceso al panel administrativo.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `email` | string | Correo electrónico del empleado. |
| `role` | string | 'admin' (control total) o 'agent' (gestión de casos). |
| `name` | string | Nombre completo del usuario. |

---

### Subcolección: `enterprises/{enterpriseId}/claims`
Documentos de cada reclamo generado.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `ticketNumber`| string | Código legible (ej: REQ-1024). |
| `status` | string | 'open', 'in_progress', 'resolved', 'closed'. |
| `customerName`| string | Nombre del cliente final. |
| `customerEmail`| string | Email para notificaciones. |
| `subject` | string | Asunto del reclamo. |
| `accessToken` | string | Hash secreto para acceso sin login del cliente. |
| `updatedAt` | timestamp | Última modificación del estado. |

---

### Subcolección: `enterprises/{enterpriseId}/claims/{claimId}/history`
Logs de auditoría y notas internas.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `action` | string | Descripción del cambio (ej: "Estado cambiado a Resuelto"). |
| `authorId` | string | ID del usuario (agente) que realizó la acción. |
| `timestamp` | timestamp | Fecha y hora del evento. |

