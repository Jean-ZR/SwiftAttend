# 1. Módulo de Autenticación

El módulo de autenticación es fundamental para la seguridad y personalización de la experiencia en SwiftAttend. Gestiona cómo los usuarios acceden al sistema y qué pueden hacer una vez dentro, basado en sus roles asignados. Utiliza Firebase Authentication para el manejo de identidades.

## 1.1. Flujo de Inicio de Sesión (`/login`)

*   **Propósito:** Permite a los usuarios registrados acceder al sistema.
*   **Componente Principal:** `src/components/auth/LoginForm.tsx`
*   **Proceso:**
    1.  El usuario ingresa su correo electrónico y contraseña.
    2.  Los datos son validados en el cliente (formato de email, contraseña no vacía).
    3.  Al enviar, el componente `LoginForm` llama directamente a la función `signInWithEmailAndPassword` del SDK de Firebase (cliente).
    4.  Firebase Authentication verifica las credenciales.
    5.  Si son válidas:
        *   Se establece una sesión de usuario en el navegador.
        *   El `AuthProvider` detecta el cambio de estado de autenticación, recupera el rol del usuario desde Firestore y actualiza el contexto de la aplicación.
        *   El usuario es redirigido a su dashboard (`/dashboard`).
    6.  Si no son válidas, se muestra un mensaje de error.
*   **Tecnologías Involucradas:** React Hook Form (para gestión de formularios), Zod (para validación de esquemas), Firebase Authentication SDK (cliente).

## 1.2. Flujo de Registro (`/signup`)

*   **Propósito:** Permite a nuevos usuarios crear una cuenta en el sistema.
*   **Componente Principal:** `src/components/auth/SignupForm.tsx`
*   **Proceso:**
    1.  El usuario ingresa su nombre completo, correo electrónico, contraseña, confirmación de contraseña y selecciona un rol (Estudiante, Profesor, Administrador).
    2.  Los datos son validados en el cliente.
    3.  Al enviar, se llama a la Server Action `signupUser` (`src/lib/actions/authActions.ts`).
    4.  La Server Action:
        *   Utiliza `createUserWithEmailAndPassword` del SDK de Firebase para crear el usuario en Firebase Authentication.
        *   Crea un documento correspondiente en la colección `users` de Firestore, almacenando el `uid`, `email`, `displayName` y `role`.
    5.  Si el registro es exitoso, el usuario es redirigido a la página de login (`/login`) para iniciar sesión con sus nuevas credenciales.
    6.  Si ocurre un error (ej: email ya en uso), se muestra un mensaje de error.
*   **Tecnologías Involucradas:** React Hook Form, Zod, Firebase Authentication SDK (usado desde Server Action), Firestore.

## 1.3. Gestión de Roles

*   **Roles Soportados:**
    *   `admin` (Administrador): Acceso completo al sistema, incluyendo gestión de usuarios y configuraciones globales.
    *   `teacher` (Profesor): Puede crear y gestionar sesiones de asistencia, ver historial de sus sesiones.
    *   `student` (Estudiante): Puede marcar asistencia y ver su historial personal.
*   **Almacenamiento del Rol:** El rol de cada usuario se almacena en su documento respectivo dentro de la colección `users` en Firestore.
*   **Obtención del Rol:** El `AuthProvider` (`src/providers/AuthProvider.tsx`) es responsable de obtener el rol del usuario desde Firestore después de un inicio de sesión exitoso y lo hace disponible globalmente en la aplicación.

## 1.4. Protección de Rutas y Componentes

*   **Layout de Aplicación (`src/app/(app)/layout.tsx`):**
    *   Este layout envuelve todas las páginas que requieren autenticación.
    *   Utiliza `useEffect` y el `AuthProvider` para verificar si un usuario está autenticado.
    *   Si un usuario no autenticado intenta acceder a una ruta protegida, es redirigido a `/login`.
*   **Visibilidad Condicional:**
    *   **Barra Lateral (`AppSidebarNav.tsx`):** Muestra diferentes elementos de menú basados en el rol del usuario.
    *   **Menú de Usuario (`UserNav.tsx`):** Ofrece opciones específicas del rol.
    *   **Dashboards:** La página `/dashboard` renderiza un componente de dashboard específico (`AdminDashboard`, `TeacherDashboard`, `StudentDashboard`) según el rol.
    *   **Páginas Específicas:** Muchas páginas (ej: `/admin/user-management`, `/attendance/generate`) tienen lógica interna para verificar el rol y restringir el acceso si no es el adecuado.

## 1.5. Cierre de Sesión

*   **Proceso:**
    1.  El usuario hace clic en la opción "Cerrar Sesión" (generalmente en `UserNav.tsx`).
    2.  Se llama a la función `signOut` del SDK de Firebase (cliente).
    3.  Firebase Authentication invalida la sesión del usuario.
    4.  El `AuthProvider` detecta el cambio y actualiza el estado.
    5.  El usuario es redirigido a `/login` (a menudo mediante `window.location.href` para asegurar una limpieza completa del estado).
