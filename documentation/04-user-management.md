# 4. Módulo de Gestión de Usuarios (Panel de Administrador)

Este módulo es exclusivo para usuarios con el rol de "admin" y les proporciona las herramientas para gestionar las cuentas de usuario dentro del sistema SwiftAttend.

## 4.1. Acceso y Propósito

*   **Ruta:** `/admin/user-management`
*   **Componente Principal:** `src/app/(app)/admin/user-management/page.tsx`
*   **Restricción de Acceso:** La página verifica el rol del usuario al cargar. Si el usuario no es "admin", se le redirige o se muestra un mensaje de acceso denegado.
*   **Propósito:** Centralizar la administración de cuentas de usuario, incluyendo la visualización, modificación de roles y creación de nuevos usuarios por parte de los administradores.

## 4.2. Componentes de UI

### 4.2.1. Tabla de Gestión de Usuarios (`UserManagementTable`)

*   **Componente:** `src/components/admin/UserManagementTable.tsx`
*   **Funcionalidad:**
    *   **Visualización:** Muestra una tabla con todos los usuarios registrados en el sistema.
    *   **Columnas:** Típicamente incluye "Nombre para Mostrar", "Correo Electrónico", "Rol Actual". Opcionalmente, podría incluir "Fecha de Creación".
    *   **Modificación de Roles:**
        *   Para cada usuario (excepto el propio administrador que está viendo la tabla, para evitar auto-bloqueo accidental), se muestra un componente `Select` (selector desplegable) que permite al administrador cambiar el rol del usuario.
        *   Los roles disponibles para seleccionar son "student", "teacher", "admin".
        *   Al cambiar un rol y (potencialmente) hacer clic en un botón "Guardar Rol" (o si el cambio es inmediato al seleccionar), se llama a la acción de servidor `updateUserRole`.
    *   **Acciones Adicionales (Potencial):** Podría incluir botones para eliminar usuarios o resetear contraseñas (requeriría Firebase Admin SDK para implementación segura).
*   **Datos:** La tabla se puebla con los datos obtenidos de la acción de servidor `getAllUsers`.
*   **Actualización:** Después de una acción exitosa (cambio de rol, creación de usuario), la tabla se actualiza para reflejar los cambios.

### 4.2.2. Formulario de Creación de Usuarios (`CreateUserForm`)

*   **Componente:** `src/components/admin/CreateUserForm.tsx`
*   **Funcionalidad:**
    *   Permite a los administradores crear nuevas cuentas de usuario directamente.
    *   **Campos del Formulario:**
        *   Nombre Completo (displayName)
        *   Correo Electrónico
        *   Contraseña
        *   Confirmar Contraseña
        *   Rol (selector con opciones "Teacher" y "Student" - los administradores no crean otros administradores directamente desde este formulario simple).
    *   Al enviar el formulario, se llama a la acción de servidor `adminCreateUser`.
*   **Validación:** Utiliza `react-hook-form` y `zod` para la validación de los campos del formulario.

## 4.3. Acciones de Servidor Involucradas (de `src/lib/actions/userActions.ts`)

*   **`getAllUsers(adminUserId: string)`:**
    *   Verifica si el `adminUserId` corresponde a un administrador.
    *   Consulta la colección `users` en Firestore y devuelve una lista de todos los documentos de usuario.
    *   Convierte los Timestamps de `createdAt` a cadenas legibles.
*   **`updateUserRole(data: { adminUserId: string, userIdToUpdate: string, newRole: UserRole })`:**
    *   Verifica si el `adminUserId` es un administrador.
    *   Actualiza el campo `role` en el documento del `userIdToUpdate` en la colección `users` de Firestore.
*   **`adminCreateUser(data: { adminUserId: string, email: string, password: string, displayName: string, role: 'teacher' | 'student' })`:**
    *   Verifica si el `adminUserId` es un administrador.
    *   Utiliza `createUserWithEmailAndPassword` de Firebase Authentication para crear la nueva cuenta de autenticación.
    *   Crea un nuevo documento en la colección `users` de Firestore para el nuevo usuario, almacenando `uid`, `email`, `displayName`, `role` especificado y `createdAt`.
*   **`getUserStats(adminUserId: string)`:**
    *   Aunque se usa en el `AdminDashboard`, esta acción también es relevante para la gestión de usuarios ya que provee conteos basados en roles.

## 4.4. Flujo de Trabajo Típico del Administrador

1.  El administrador navega a la página de "Gestión de Usuarios" desde su dashboard.
2.  Ve la lista de todos los usuarios.
3.  **Para cambiar un rol:** Selecciona un nuevo rol para un usuario en la tabla y guarda el cambio. La tabla se refresca.
4.  **Para crear un usuario:** Rellena el formulario de "Crear Nuevo Usuario" con los detalles y el rol (profesor o estudiante) y lo envía. Si es exitoso, el nuevo usuario aparece en la tabla.
