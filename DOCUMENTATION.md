
# Documentación del Sistema SwiftAttend

## 1. Visión General

SwiftAttend es una aplicación web diseñada para modernizar y simplificar el proceso de seguimiento de asistencia en instituciones educativas. Utiliza un sistema de códigos QR para un marcado rápido y eficiente, y ofrece diferentes vistas y funcionalidades según el rol del usuario (Administrador, Profesor, Estudiante). La aplicación está construida con Next.js, React, Tailwind CSS, ShadCN UI para los componentes, y Firebase para la autenticación y la base de datos en tiempo real (Firestore).

## 2. Características Principales y Secciones

El sistema se divide en varias secciones clave, cada una con funcionalidades específicas:

### 2.1. Autenticación

*   **Login (`/login`):** Permite a los usuarios existentes acceder al sistema utilizando su correo electrónico y contraseña. La autenticación se realiza contra Firebase Authentication. Tras un inicio de sesión exitoso, el usuario es redirigido a su dashboard.
*   **Signup (`/signup`):** Permite a nuevos usuarios registrarse en el sistema. Se requiere un nombre completo, correo electrónico, contraseña y la selección de un rol (Estudiante, Profesor, Administrador). Los datos del usuario se guardan en Firebase Authentication y se crea un perfil correspondiente en la colección `users` de Firestore.
*   **Gestión de Roles:** El sistema soporta tres roles principales:
    *   **Administrador:** Tiene acceso completo al sistema, incluyendo la gestión de todos los usuarios y la configuración global.
    *   **Profesor:** Puede crear y gestionar sesiones de asistencia para sus cursos, generar códigos QR y ver el historial de asistencia de sus sesiones.
    *   **Estudiante:** Puede marcar su asistencia usando códigos de sesión y ver su propio historial de asistencia.
*   **Protección de Rutas:** Las rutas dentro de la aplicación (`/dashboard`, `/settings`, etc.) están protegidas. Si un usuario no autenticado intenta acceder a ellas, es redirigido a la página de login. Además, ciertas páginas o funcionalidades dentro de la aplicación están restringidas según el rol del usuario.

### 2.2. Dashboards (`/dashboard`)

Cada rol de usuario tiene un dashboard personalizado que sirve como página principal después del inicio de sesión.

*   **Dashboard del Administrador:**
    *   **Visión General:** Muestra estadísticas clave del sistema, como el número total de usuarios, profesores, estudiantes y administradores.
    *   **Acciones Rápidas:**
        *   **Manage Users:** Enlace a la página de gestión de usuarios.
        *   **Manage Attendance Sessions:** Enlace para crear/gestionar sesiones de asistencia (similar a la vista del profesor).
        *   **View Attendance History:** Enlace para ver el historial de todas las sesiones de asistencia.
        *   **System Settings:** Enlace a la página de configuración general de la aplicación.
        *   **View Reports (Próximamente):** Espacio para futuras funcionalidades de reportes.
*   **Dashboard del Profesor:**
    *   **Visión General:** Muestra información relevante para el profesor, como el número total de sesiones creadas y las sesiones actualmente activas.
    *   **Acciones Rápidas:**
        *   **Manage Sessions (QR):** Enlace a la página para generar/gestionar sesiones de asistencia y sus códigos QR.
        *   **View Attendance History:** Enlace a su historial de sesiones de asistencia y los alumnos que asistieron.
        *   **Manage Students (Próximamente):** Espacio para futuras funcionalidades de gestión de estudiantes asignados.
    *   **Upcoming Classes (Próximamente):** Espacio para mostrar clases programadas.
*   **Dashboard del Estudiante:**
    *   **Visión General:** Muestra un resumen de su actividad, como el total de asistencias marcadas.
    *   **Acciones Rápidas:**
        *   **Mark Attendance:** Enlace a la página para ingresar un código de sesión y marcar asistencia.
        *   **View My Attendance:** Enlace a su historial personal de asistencia.
    *   **Recent Activity:** Muestra las últimas asistencias registradas.

### 2.3. Sistema de Asistencia

Esta es la funcionalidad central de la aplicación.

*   **Generación de Sesiones de Asistencia (`/attendance/generate`):**
    *   Accesible por Profesores y Administradores.
    *   Permite crear una nueva sesión de asistencia especificando un nombre de curso/título.
    *   Genera un ID de sesión único (UUID) y un valor QR (una URL que apunta a `/attendance/mark/[sessionId]`).
    *   Guarda la sesión en la colección `attendanceSessions` de Firestore, marcándola inicialmente como no activa.
    *   El profesor puede "Iniciar Sesión", lo que actualiza el estado de la sesión a `active` en Firestore.
    *   Una vez iniciada, se muestra el código QR y el ID de sesión para que los estudiantes lo usen.
    *   El profesor puede "Finalizar Sesión", actualizando el estado a `inactive`.
    *   Se pueden generar nuevos códigos (sesiones) si la actual no se ha iniciado.
*   **Marcar Asistencia:**
    *   **Página de Entrada (`/attendance/mark`):** Los estudiantes ingresan el código de sesión (ID de sesión) proporcionado por el profesor.
    *   **Página de Marcado (`/attendance/mark/[sessionId]`):**
        *   Tras ingresar un código válido, el estudiante es redirigido aquí.
        *   Muestra los detalles de la sesión (nombre del curso).
        *   Verifica si la sesión es válida y está activa.
        *   El estudiante confirma su asistencia.
        *   Se crea un registro en la colección `attendanceRecords` con el `sessionId`, `studentId`, `studentName`, `timestamp` y `status` ("present").
        *   Incluye validaciones para evitar que un estudiante marque asistencia múltiples veces para la misma sesión.
*   **Historial de Asistencia:**
    *   **Estudiantes (`/student/my-attendance`):** Muestra una lista de todas las sesiones en las que el estudiante ha sido marcado, incluyendo el nombre del curso, la fecha y el estado.
    *   **Profesores/Administradores (`/teacher/attendance-history`):**
        *   Muestra una lista de todas las sesiones creadas por el profesor (o todas las sesiones si es admin).
        *   Cada sesión es un acordeón que, al expandirse, muestra la lista de estudiantes que marcaron asistencia, con su nombre y la hora.
        *   Permite al profesor/admin finalizar una sesión activa o reiniciar una sesión finalizada directamente desde esta vista.

### 2.4. Gestión de Usuarios (Panel de Administrador) (`/admin/user-management`)

*   Accesible solo por Administradores.
*   **Visualización de Usuarios:** Muestra una tabla con todos los usuarios registrados en el sistema, incluyendo su nombre, correo electrónico y rol actual.
*   **Modificación de Roles:** Permite a los administradores cambiar el rol de cualquier usuario (incluyendo promocionar a otro admin o degradar). Un administrador no puede cambiar su propio rol desde esta tabla para evitar bloqueos.
*   **Creación de Usuarios:** Un formulario permite a los administradores crear nuevas cuentas de usuario para Profesores y Estudiantes, especificando nombre, correo, contraseña y rol.

### 2.5. Configuración (`/settings`)

*   Accesible por todos los usuarios autenticados.
*   **Apariencia:**
    *   Permite al usuario cambiar el tema de la aplicación (Claro, Oscuro, Sistema).
*   **Perfil:**
    *   Muestra el correo electrónico del usuario (no editable).
    *   Permite al usuario actualizar su nombre para mostrar (Display Name).
    *   Botón para cambiar contraseña (funcionalidad futura indicada).
*   **Notificaciones (Próximamente):** Espacio para futuras configuraciones de notificación.

## 3. Estructura de Firebase Firestore

La aplicación utiliza las siguientes colecciones principales en Firestore:

*   **`users`**:
    *   ID del Documento: `uid` del usuario (el mismo que en Firebase Authentication).
    *   Campos:
        *   `uid` (string): ID único del usuario.
        *   `email` (string): Correo electrónico del usuario.
        *   `displayName` (string): Nombre para mostrar del usuario.
        *   `role` (string): Rol del usuario ("admin", "teacher", "student").
        *   `createdAt` (Timestamp): Fecha y hora de creación del perfil.
*   **`attendanceSessions`**:
    *   ID del Documento: `sessionId` (string, generado como UUID).
    *   Campos:
        *   `teacherId` (string): UID del profesor que creó la sesión.
        *   `courseName` (string): Nombre del curso o título de la sesión.
        *   `createdAt` (Timestamp): Fecha y hora de creación de la sesión.
        *   `active` (boolean): Indica si la sesión está actualmente activa para marcar asistencia.
        *   `qrCodeValue` (string): La URL completa que se codifica en el QR (ej: `https://[dominio]/attendance/mark/[sessionId]`).
        *   `attendees` (array): Inicialmente vacío, podría usarse para un resumen rápido (opcional, ya que `attendanceRecords` es la fuente principal).
*   **`attendanceRecords`**:
    *   ID del Documento: Autogenerado por Firestore.
    *   Campos:
        *   `sessionId` (string): ID de la sesión de asistencia a la que pertenece este registro.
        *   `studentId` (string): UID del estudiante que marcó asistencia.
        *   `studentName` (string): Nombre del estudiante (para facilitar la visualización).
        *   `timestamp` (Timestamp): Fecha y hora en que se marcó la asistencia.
        *   `status` (string): Estado de la asistencia (ej: "present").

## 4. Posibles Mejoras y Futuras Funcionalidades

*   **Generación Real de QR Codes:** Integrar una librería (ej: `qrcode.react`) para mostrar imágenes QR funcionales en lugar de placeholders.
*   **Notificaciones:** Implementar un sistema de notificaciones (ej: recordatorios de clases, confirmación de asistencia).
*   **Informes Avanzados:**
    *   Para profesores: Reportes de asistencia por curso, por estudiante, con porcentajes.
    *   Para administradores: Reportes globales del sistema, actividad de usuarios.
*   **Gestión de Cursos/Clases:** Permitir a los profesores crear cursos y asociar sesiones de asistencia a ellos. Programación de clases.
*   **Gestión de Estudiantes por Profesor:** Permitir a los profesores ver y gestionar listas de estudiantes inscritos en sus cursos.
*   **Firebase Admin SDK:** Implementar el SDK de Admin en el backend (Server Actions) para una gestión de usuarios más segura y potente (ej: desactivar usuarios, resetear contraseñas directamente, etc.) en lugar de depender de llamadas del SDK cliente desde el servidor.
*   **Edición de Perfil Avanzada:** Permitir a los usuarios subir foto de perfil, cambiar más detalles.
*   **Recuperación de Contraseña:** Implementar el flujo completo de "Olvidé mi contraseña".
*   **Internacionalización (i18n):** Soportar múltiples idiomas.
*   **Pruebas Unitarias e Integración:** Añadir un framework de pruebas para asegurar la calidad del código.
*   **Optimización de Rendimiento:** Analizar y optimizar consultas a Firestore, carga de componentes.
*   **PWA (Progressive Web App):** Mejorar la experiencia móvil con capacidades offline y de instalación.
*   **Exportación de Datos:** Permitir exportar historiales de asistencia (ej: a CSV, PDF).
*   **Integración con Sistemas de Gestión de Aprendizaje (LMS):** Sincronizar datos con plataformas LMS existentes.
*   **Auditoría de Cambios:** Registrar quién hizo qué cambios importantes en el sistema (ej: cambio de roles).
*   **Mejoras de UX/UI:** Refinamiento continuo de la interfaz y experiencia de usuario.
*   **Accesibilidad (a11y):** Asegurar que la aplicación cumple con los estándares de accesibilidad web.
*   **Validación de Código de Sesión en Tiempo Real (WebSocket/Firestore Listeners):** Para la página de entrada del código de sesión, se podría verificar la validez del código en tiempo real mientras el usuario escribe, en lugar de esperar al envío.
*   **Mecanismos de Asistencia Alternativos:** Considerar métodos adicionales como geolocalización (con consentimiento) o códigos de un solo uso para mayor seguridad.
*   **Personalización de Plantillas de Correo:** Si se implementan correos (ej: bienvenida, reseteo de contraseña), permitir personalización.
*   **Módulo de Anuncios:** Una sección donde administradores o profesores puedan publicar anuncios.

Este documento debe ser actualizado a medida que la aplicación evoluciona.
        