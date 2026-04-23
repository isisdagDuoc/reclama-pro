## ADDED Requirements

### Requirement: Layout del grupo auth sin sidebar
El sistema SHALL proveer un layout para el route group `(auth)` que NO incluya la sidebar del panel. El layout aplica un fondo `#f1f5f9` (slate-100) a toda la pantalla.

#### Scenario: Pantalla de login sin elementos del panel
- **WHEN** el usuario accede a `/login`
- **THEN** la pantalla muestra solo el formulario centrado, sin sidebar ni navegación del panel

### Requirement: Página de login con formulario centrado
El sistema SHALL proveer una página en `(auth)/login` con un formulario centrado verticalmente y horizontalmente. La página contiene: logo/nombre de la app, campo email, campo contraseña, botón de submit.

#### Scenario: Render inicial
- **WHEN** el usuario accede a `/login`
- **THEN** la página muestra un card centrado con campos email y contraseña habilitados y el botón de submit activo

#### Scenario: Submit en progreso
- **WHEN** el usuario hace submit del formulario
- **THEN** el botón se deshabilita y muestra texto "Iniciando sesión..." para prevenir doble submit

#### Scenario: Error de credenciales
- **WHEN** el Server Action retorna un error
- **THEN** la página muestra un mensaje de error debajo del formulario sin limpiar los campos

#### Scenario: Login exitoso
- **WHEN** el Server Action confirma la sesión
- **THEN** el browser navega a `/dashboard` (via redirect del Server Action)

### Requirement: Estilos del login según paleta del panel
El sistema SHALL aplicar los colores definidos para el flujo panel/auth: fondo `#f1f5f9`, card en `#ffffff` con `border: 1px solid #e2e8f0` y `border-radius: 8px`, botón de submit en `#1d4ed8` (azul).

#### Scenario: Variables CSS en el layout de auth
- **WHEN** el layout de `(auth)` renderiza
- **THEN** las variables `--color-auth-bg`, `--color-card`, `--color-border` y `--color-sidebar` están disponibles para los componentes hijos via CSS custom properties en `:root`
