# 5. Módulo de Configuración (`/settings`)

La página de Configuración permite a los usuarios autenticados personalizar ciertos aspectos de su experiencia en la aplicación y gestionar información básica de su perfil.

## 5.1. Acceso y Propósito

*   **Ruta:** `/settings`
*   **Componente Principal:** `src/app/(app)/settings/page.tsx`
*   **Acceso:** Disponible para todos los usuarios autenticados (admin, teacher, student). El contenido específico o la capacidad de editar ciertos campos puede variar, aunque actualmente es bastante uniforme.
*   **Propósito:**
    *   Permitir la personalización de la apariencia de la aplicación (tema).
    *   Permitir la gestión de información básica del perfil del usuario.
    *   Servir como un lugar para futuras configuraciones (ej: notificaciones).

## 5.2. Secciones y Funcionalidades

### 5.2.1. Apariencia

*   **Componente:** `ModeToggle` (`src/components/ModeToggle.tsx`) integrado en la página de Configuración.
*   **Funcionalidad:**
    *   Permite al usuario cambiar el tema visual de la aplicación.
    *   Opciones: "Light" (Claro), "Dark" (Oscuro), "System" (Sigue la preferencia del sistema operativo).
    *   Utiliza `next-themes` para gestionar el estado del tema y aplicarlo globalmente.
    *   La preferencia se guarda (generalmente en `localStorage`) para persistir entre sesiones.

### 5.2.2. Perfil

*   **Funcionalidad:**
    *   **Correo Electrónico:** Muestra el correo electrónico del usuario logueado. Este campo es de solo lectura y no se puede modificar desde esta interfaz.
    *   **Nombre para Mostrar (`displayName`):**
        *   Muestra el nombre para mostrar actual del usuario.
        *   Permite al usuario editar este campo.
        *   Al hacer clic en "Save Profile Changes", se llama a la acción de servidor `updateUserDisplayName`.
    *   **Cambiar Contraseña:**
        *   Un botón "Change Password".
        *   Actualmente, esta funcionalidad está marcada como "Próximamente". Al hacer clic, muestra un toast informativo. La implementación completa requeriría un flujo seguro para el cambio de contraseña (ej: verificar contraseña actual, enviar enlace de reseteo, etc.).
*   **Acción de Servidor Involucrada (de `src/lib/actions/userActions.ts`):**
    *   `updateUserDisplayName({ userId: string, newDisplayName: string })`:
        *   Valida los datos de entrada.
        *   Intenta actualizar el `displayName` en Firebase Authentication para el usuario actual (con las limitaciones mencionadas anteriormente sobre actualizaciones de Auth desde server actions).
        *   Actualiza el campo `displayName` en el documento del usuario en la colección `users` de Firestore.
        *   Devuelve un mensaje de éxito o error.

### 5.2.3. Notificaciones

*   **Funcionalidad:**
    *   Actualmente es un marcador de posición.
    *   Indica que las configuraciones de notificación estarán disponibles en una futura actualización.
    *   Podría incluir opciones para activar/desactivar diferentes tipos de notificaciones (ej: por correo electrónico, push) para eventos como nuevas tareas, recordatorios de asistencia, etc.

## 5.3. Experiencia de Usuario

*   La página está estructurada usando componentes `Card` de ShadCN UI para agrupar las diferentes categorías de configuración.
*   Se utilizan `Label`, `Input`, `Button` y `Separator` para construir los formularios y elementos de la interfaz.
*   Se provee retroalimentación al usuario mediante `toast` notifications para acciones como guardar cambios o para funcionalidades no implementadas.
*   Muestra un estado de carga (`Loader2` en botones) durante las operaciones asíncronas (ej: al guardar el perfil).

## 5.4. Consideraciones de Implementación

*   **Actualización de `displayName`:** Como se mencionó, la actualización del `displayName` en Firebase Authentication desde una Server Action es indirecta. El `AuthProvider` en el cliente podría no reflejar el cambio inmediatamente sin una recarga o un nuevo inicio de sesión. Una mejora sería que el cliente actualice `firebase.auth().currentUser.updateProfile()` y luego llame a una acción del servidor solo para sincronizar Firestore.
*   **Cambio de Contraseña:** La implementación completa del cambio de contraseña requiere consideraciones de seguridad y un flujo de usuario bien definido, que está fuera del alcance actual de esta sección pero es una mejora importante.
