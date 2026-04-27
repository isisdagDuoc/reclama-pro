# Sistema de diseño — Reclama Pro

El proyecto tiene **dos aplicaciones visualmente distintas** que no comparten layout ni paleta de color primaria. Esta separación es intencional: el panel admin es una herramienta de trabajo para desktop; el portal del cliente es una vista simple que funciona también en mobile.

---

## Panel Admin / Pyme — `(auth)/` y `(panel)/`

### Paleta de colores

```css
--color-sidebar:     #1d4ed8;  /* blue-700   — barra lateral de navegación */
--color-cta:         #059669;  /* emerald-600 — botones de acción primaria */
--color-auth-bg:     #1e293b;  /* slate-800  — header en pantallas de auth */
--color-text:        #0f172a;  /* slate-900  — texto primario */
--color-text-muted:  #64748b;  /* slate-500  — texto secundario y metadata */
--color-surface:     #f8fafc;  /* slate-50   — fondo del panel */
--color-card:        #ffffff;  /* blanco     — fondo de cards y tablas */
--color-border:      #e2e8f0;  /* slate-200  — bordes de cards e inputs */
```

### Layout

```
┌─────────────────────────────────────────────────┐
│  Sidebar 220px (fijo)  │  Main content           │
│  ─────────────────────  │  ─────────────────────  │
│  Logo + nombre app     │  Título de página        │
│                        │                         │
│  ○ Dashboard           │  Stats / tabla / form   │
│  ● Reclamos (activo)   │                         │
│  ○ Reportes            │                         │
│                        │                         │
│  ── (bottom) ──        │                         │
│  Avatar + nombre user  │                         │
└─────────────────────────────────────────────────┘
```

- La sidebar es `#1d4ed8` con links en `rgba(255,255,255,.65)` y el ítem activo en `rgba(255,255,255,.15)`
- Las pantallas de `(auth)/` no tienen sidebar — formulario centrado sobre fondo `#f1f5f9`

---

## Portal del Cliente — `[slug]/`

### Paleta de colores

```css
--color-nav:     #15803d;  /* green-700 — navbar con nombre de la empresa */
--color-cta:     #16a34a;  /* green-600 — botón Enviar comentario */
--color-rating:  #b45309;  /* amber-700 — botón Enviar valoración */
--color-surface: #f8fafc;  /* slate-50  — fondo exterior */
--color-card:    #ffffff;  /* blanco    — card del reclamo */
```

### Layout

Una sola pantalla. El cliente recibe un link único — no hay navegación ni lista de reclamos. La card está centrada con `max-width: 680px` y funciona en mobile y desktop.

```
┌────────────────────────────────┐
│  Navbar verde — empresa · REQ  │
└────────────────────────────────┘
        ┌──────────────────┐
        │  Badge de estado │
        │  Título reclamo  │
        │  Fecha           │
        │  ─────────────── │
        │  Descripción     │
        │  ─────────────── │
        │  Historial msgs  │
        │  ─────────────── │
        │  [Campo respuesta│
        │   solo si activo]│
        │                  │
        │  [Valoración     │
        │   solo si cerrado│
        │   y sin rating]  │
        └──────────────────┘
```

---

## Estados de reclamo — compartidos por ambos flujos

Los colores de estado son los mismos en panel y portal. Se derivan siempre de `ClaimStatus` — nunca se hardcodean strings de color en los componentes.

| Estado | `ClaimStatus` | Fondo | Texto |
|---|---|---|---|
| Abierto | `open` | `#dbeafe` blue-100 | `#1e40af` blue-800 |
| En proceso | `in_progress` | `#fef3c7` amber-100 | `#92400e` amber-800 |
| Resuelto | `resolved` | `#d1fae5` emerald-100 | `#065f46` emerald-800 |
| Cerrado | `closed` | `#fee2e2` red-100 | `#991b1b` red-800 |

---

## Pantallas del panel

| Pantalla | Ruta | Descripción |
|---|---|---|
| Login | `/login` | Card centrada sin sidebar. Email, contraseña, botón azul |
| Registro | `/register` | Registro de nueva empresa. Genera slug automático |
| Dashboard | `/dashboard` | 4 stat cards + tabla de reclamos recientes |
| Reclamos | `/claims` | Tabla completa, filtros por estado (tabs/pills), buscador |
| Crear reclamo | `/claims/new` | Formulario. El agente ingresa datos del cliente y descripción |
| Detalle | `/claims/[id]` | 2 columnas: historial + respuesta (izq), sidebar con estado y link del cliente (der) |
| Reportes | `/reports` | Stats + tabla por categoría + exportar PDF |

---

## Convenciones de componentes

- **CSS Modules**: un archivo `.module.css` por componente. Sin Tailwind.
- **Variables CSS**: definidas en `:root` dentro del `layout.tsx` de cada route group. Nunca hex hardcodeado en componentes hoja.
- **Tipografía**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Sin Google Fonts.
- **Border radius**: cards `8px` · botones e inputs `6px` · badges `9999px`
- **Sombras**: cards del portal `0 2px 16px rgba(0,0,0,.1)` · cards del panel solo `border: 1px solid var(--color-border)`, sin sombra
