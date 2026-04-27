# Reclama Pro

Plataforma web multi-tenant para la gestión de tickets de reclamos orientada a Pymes chilenas. Permite a las empresas centralizar y dar trazabilidad a los requerimientos de sus clientes desde un panel administrativo, mientras los clientes acceden al estado de su caso mediante un link único sin necesidad de crear una cuenta.

**Deploy:** [reclama-pro.vercel.app](https://reclama-pro.vercel.app)

---

## ¿Qué hace?

- Las empresas gestionan reclamos desde un **panel privado** con roles (admin y agente)
- Los clientes acceden a su reclamo desde un **portal público** mediante un link único generado por el sistema
- Ciclo de vida: `open → in_progress → resolved → closed`
- Tickets numerados secuencialmente por empresa (`REC-00001`, `REC-00002`, …)
- Historial de comunicación bidireccional entre agente y cliente
- Valoración del cliente post-resolución (1–5 estrellas)
- Reportes con KPIs de satisfacción y exportación PDF

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2 App Router (TypeScript strict) |
| Base de datos | Cloud Firestore |
| Autenticación | Firebase Auth con Custom Claims |
| Deploy | Vercel |

---

## Documentación técnica

| Documento | Contenido |
|---|---|
| [Arquitectura](./docs/arquitectura.md) | Patrón BFF, estructura de carpetas, auth, aislación multi-tenant |
| [Flujos del sistema](./docs/flujos.md) | Diagramas de usuario, ciclo de reclamo, comunicación agente-cliente |
| [Modelo de datos](./docs/modelo-datos.md) | Colecciones Firestore, campos, relaciones, decisiones de estructura |
| [Sistema de diseño](./docs/diseno.md) | Paletas, layouts, estados visuales, convenciones de componentes |
| [Decisiones técnicas](./docs/decisiones-tecnicas.md) | Por qué cada elección de arquitectura y las alternativas descartadas |

---

## Comenzar a desarrollar

Consulta la **[Guía de inicio](./GETTING_STARTED.md)** para configurar el entorno local con Firebase paso a paso.

---

## Equipo

| Usuario | Rol |
|---|---|
| [@isisdagduoc](https://github.com/isisdagduoc) | Autora |
| [@GisDuoc](https://github.com/GisDuoc) | Autora |
| [@Marcelocarrascoduoc](https://github.com/Marcelocarrascoduoc) | Autor |
