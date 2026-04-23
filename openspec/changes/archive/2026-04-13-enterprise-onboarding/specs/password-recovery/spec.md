## ADDED Requirements

### Requirement: Página "Olvidé mi contraseña"
El sistema SHALL proveer una página en `(auth)/forgot-password` con un campo de email y un botón para solicitar el envío del enlace de restablecimiento. La respuesta al usuario SHALL ser siempre la misma sin importar si el email existe o no (prevención de enumeración de usuarios).

#### Scenario: Render inicial
- **WHEN** el usuario accede a `/forgot-password`
- **THEN** la página muestra un campo de email, texto explicativo, y el botón "Enviar enlace"

#### Scenario: Email con formato inválido
- **WHEN** el usuario hace submit con un email que no cumple el formato estándar
- **THEN** el sistema muestra "El formato no es válido" y bloquea el submit

#### Scenario: Email vacío al submit
- **WHEN** el usuario hace submit con el campo email vacío
- **THEN** el sistema muestra "Ingresa tu correo electrónico" y bloquea el submit

#### Scenario: Email enviado (existe o no existe)
- **WHEN** el usuario hace submit con un email con formato válido
- **THEN** el sistema llama `sendPasswordResetEmail()` con el email y los `actionCodeSettings`, luego muestra "Si el correo está registrado, recibirás un enlace en los próximos minutos" — el mismo mensaje siempre, independientemente de si el email tiene cuenta

#### Scenario: Submit en progreso
- **WHEN** el usuario hace submit del formulario
- **THEN** el botón se deshabilita hasta recibir respuesta, previniendo doble submit

### Requirement: Envío de email de reset via Firebase Auth
El sistema SHALL usar `sendPasswordResetEmail(auth, email, actionCodeSettings)` del client SDK de Firebase para enviar el email. El `actionCodeSettings.url` SHALL apuntar a `${NEXT_PUBLIC_APP_URL}/reset-password` con `handleCodeInApp: true`.

#### Scenario: Email de reset enviado correctamente
- **WHEN** `sendPasswordResetEmail` se ejecuta sin error
- **THEN** Firebase envía el email con un link que lleva a `{NEXT_PUBLIC_APP_URL}/reset-password?oobCode=...&mode=resetPassword`

#### Scenario: Error de Firebase al enviar
- **WHEN** `sendPasswordResetEmail` falla por error de red u otro error de Firebase
- **THEN** el sistema muestra "Error de conexión. Verifica tu internet e intenta de nuevo" — sin revelar si el email existe o no

### Requirement: Página de restablecimiento de contraseña
El sistema SHALL proveer una página en `(auth)/reset-password` que recibe el `oobCode` y `mode=resetPassword` de la URL (enviados por Firebase en el link del email), permite al usuario ingresar y confirmar su nueva contraseña, y llama `confirmPasswordReset(auth, oobCode, newPassword)`.

#### Scenario: Render con oobCode válido
- **WHEN** el usuario llega a `/reset-password?oobCode=ABC&mode=resetPassword`
- **THEN** la página muestra el formulario de nueva contraseña con dos campos (nueva contraseña, confirmar contraseña)

#### Scenario: oobCode ausente en la URL
- **WHEN** el usuario accede a `/reset-password` sin parámetro `oobCode`
- **THEN** la página muestra "El enlace no es válido. [Solicitar uno nuevo]" con link a `/forgot-password`

#### Scenario: Contraseña nueva vacía
- **WHEN** el usuario hace submit con la nueva contraseña vacía
- **THEN** el sistema muestra "Ingresa tu nueva contraseña"

#### Scenario: Contraseña nueva demasiado corta
- **WHEN** el usuario ingresa una contraseña con menos de 6 caracteres
- **THEN** el sistema muestra "La contraseña debe tener al menos 6 caracteres"

#### Scenario: Contraseñas no coinciden (on blur)
- **WHEN** el usuario sale del campo "confirmar contraseña" y los valores no coinciden
- **THEN** el sistema muestra "Las contraseñas no coinciden" inmediatamente

#### Scenario: Reset exitoso
- **WHEN** `confirmPasswordReset(auth, oobCode, newPassword)` se completa sin error
- **THEN** la página muestra "Contraseña actualizada." con un link a `/login`

#### Scenario: oobCode vencido o ya usado
- **WHEN** `confirmPasswordReset` lanza `auth/expired-action-code` o `auth/invalid-action-code`
- **THEN** la página muestra "El enlace venció o ya fue usado." con link a `/forgot-password` para solicitar uno nuevo

#### Scenario: Contraseñas coinciden (validación on blur)
- **WHEN** el usuario sale del campo "confirmar contraseña" y los valores coinciden
- **THEN** no se muestra ningún error de coincidencia
