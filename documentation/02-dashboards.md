# 2. Módulo de Dashboards (`/dashboard`)

Los dashboards son las páginas de inicio personalizadas para cada tipo de usuario después de iniciar sesión. Proporcionan una visión general relevante para su rol y accesos directos a las funcionalidades clave.

## 2.1. Lógica de Enrutamiento del Dashboard

*   **Ruta Principal:** `/dashboard`
*   **Componente:** `src/app/(app)/dashboard/page.tsx`
*   **Funcionamiento:**
    1.  Este componente utiliza el `useAuth()` hook para obtener el `user` y `role` del usuario autenticado.
    2.  Basado en el `role`, renderiza dinámicamente uno de los siguientes componentes de dashboard específicos:
        *   `AdminDashboard` si el rol es "admin".
        *   `TeacherDashboard` si el rol es "teacher".
        *   `StudentDashboard` si el rol es "student".
    3.  Si el rol no es reconocido, muestra un mensaje de error.
    4.  Muestra un mensaje de bienvenida general con el nombre del usuario.

## 2.2. Dashboard del Administrador (`AdminDashboard`)

*   **Componente:** `src/components/dashboard/AdminDashboard.tsx`
*   **Propósito:** Ofrecer al administrador una vista consolidada del estado del sistema y acceso rápido a las herramientas de gestión.
*   **Características:**
    *   **Banner Principal:** Una imagen visual o un resumen destacado.
    *   **Tarjetas de Estadísticas:**
        *   **Usuarios Totales:** Número total de usuarios registrados (obtenido de la acción `getUserStats`).
        *   **Profesores Totales:** Número total de usuarios con rol "teacher".
        *   **Estudiantes Totales:** Número total de usuarios con rol "student".
        *   **Admins Totales:** Número total de usuarios con rol "admin".
        *   Cada tarjeta incluye un icono representativo y una breve descripción.
        *   Muestra un estado de carga (esqueletos) mientras se obtienen los datos.
    *   **Acciones Rápidas (Botones/Tarjetas):**
        *   **Manage Users:** Enlace a `/admin/user-management` para la gestión de usuarios.
        *   **Manage Attendance Sessions:** Enlace a `/attendance/generate` (el admin puede crear/gestionar sesiones como un profesor).
        *   **View Attendance History:** Enlace a `/teacher/attendance-history` (el admin puede ver el historial de todas las sesiones).
        *   **System Settings:** Enlace a `/settings`.
        *   **View Reports:** Marcado como "(Próximamente)".
*   **Tecnologías Involucradas:** React, ShadCN UI (Card, Button, Skeleton), Lucide Icons, Server Actions (para obtener estadísticas).

## 2.3. Dashboard del Profesor (`TeacherDashboard`)

*   **Componente:** `src/components/dashboard/TeacherDashboard.tsx`
*   **Propósito:** Proporcionar al profesor las herramientas necesarias para gestionar sus sesiones de asistencia y ver información relevante.
*   **Características:**
    *   **Banner Principal.**
    *   **Acciones Rápidas (Botones/Tarjetas):**
        *   **Manage Sessions (QR):** Enlace a `/attendance/generate` para crear/gestionar sesiones y sus códigos QR.
        *   **View Attendance History:** Enlace a `/teacher/attendance-history` para su historial de sesiones de asistencia.
        *   **Manage Students:** Marcado como "(Coming Soon)".
    *   **Tarjetas de Estadísticas:**
        *   **Total Sessions Created:** Número total de sesiones creadas por ese profesor (obtenido de `getTeacherAttendanceSessions`).
        *   **Active Sessions:** Número de sesiones actualmente activas para ese profesor.
        *   Muestra un estado de carga.
    *   **Upcoming Classes:** Sección marcada como "(Coming Soon)", para futuras funcionalidades de programación.
*   **Tecnologías Involucradas:** React, ShadCN UI, Lucide Icons, Server Actions.

## 2.4. Dashboard del Estudiante (`StudentDashboard`)

*   **Componente:** `src/components/dashboard/StudentDashboard.tsx`
*   **Propósito:** Permitir al estudiante marcar su asistencia fácilmente y ver un resumen de su actividad.
*   **Características:**
    *   **Banner Principal.**
    *   **Acciones Rápidas (Botones/Tarjetas):**
        *   **Mark Attendance:** Enlace a `/attendance/mark` para ingresar un código de sesión.
        *   **View My Attendance:** Enlace a `/student/my-attendance` para su historial personal.
    *   **Tarjetas de Estadísticas/Información:**
        *   **Total Attendances Marked:** Número de veces que el estudiante ha sido marcado como "presente" (obtenido de `getStudentAttendanceHistory`).
        *   **Recent Activity:** Muestra una tabla con las últimas 3 asistencias registradas por el estudiante.
        *   Muestra un estado de carga.
*   **Tecnologías Involucradas:** React, ShadCN UI, Lucide Icons, Server Actions.
