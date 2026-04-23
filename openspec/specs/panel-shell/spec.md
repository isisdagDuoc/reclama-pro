## ADDED Requirements

### Requirement: Layout del panel con sidebar fija
El sistema SHALL proveer un layout para el route group `(panel)` con una sidebar fija de 220px de ancho en el lado izquierdo y un área de contenido principal que ocupa el resto del ancho. El layout aplica fondo `#f8fafc` (slate-50) al área de contenido.

#### Scenario: Estructura visual del panel
- **WHEN** el usuario accede a cualquier ruta del grupo `(panel)`
- **THEN** la pantalla muestra sidebar a la izquierda y contenido principal a la derecha

#### Scenario: Sidebar con color definido
- **WHEN** el layout del panel renderiza
- **THEN** la sidebar tiene fondo `#1d4ed8` (blue-700) con el logo/nombre de la app en la parte superior y el avatar/nombre del usuario en la parte inferior

### Requirement: Navegación de la sidebar
El sistema SHALL mostrar en la sidebar los siguientes ítems de navegación: Dashboard, Reclamos, Reportes. El ítem activo se distingue visualmente del resto.

#### Scenario: Ítem activo resaltado
- **WHEN** el usuario está en `/dashboard`
- **THEN** "Dashboard" aparece con fondo `rgba(255,255,255,0.15)` y los demás ítems con texto `rgba(255,255,255,0.65)`

#### Scenario: Navegación entre secciones
- **WHEN** el usuario hace click en un ítem de navegación
- **THEN** el browser navega a la ruta correspondiente (`/dashboard`, `/claims`, `/reports`)

### Requirement: Dashboard dummy como primera ruta del panel
El sistema SHALL proveer una página en `(panel)/dashboard` que muestre el shell del panel funcionando. Para esta feature, el contenido es placeholder (sin datos reales de Firestore).

#### Scenario: Dashboard accesible post-login
- **WHEN** el usuario se autentica exitosamente
- **THEN** es redirigido a `/dashboard` y ve el layout del panel con contenido placeholder

#### Scenario: Dashboard sin datos reales
- **WHEN** el dashboard renderiza en esta feature
- **THEN** muestra el título "Dashboard" y un mensaje placeholder, sin queries a Firestore

### Requirement: Botón de logout en el panel
El sistema SHALL proveer un botón de logout accesible desde el layout del panel (en la parte inferior de la sidebar junto al avatar del usuario) que ejecuta el Server Action `logout`.

#### Scenario: Logout desde el panel
- **WHEN** el usuario hace click en el botón de logout
- **THEN** se ejecuta el Server Action `logout`, se elimina la cookie de sesión y el browser navega a `/login`
