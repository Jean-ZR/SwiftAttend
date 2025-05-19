# 3. Módulo del Sistema de Asistencia

Este es el núcleo funcional de SwiftAttend, permitiendo la creación de sesiones de asistencia, la generación y uso de códigos QR (o IDs de sesión), y el registro de la asistencia de los participantes.

## 3.1. Generación de Sesiones de Asistencia (`/attendance/generate`)

*   **Propósito:** Permitir a Profesores y Administradores crear y gestionar sesiones de asistencia.
*   **Componente Principal:** `src/app/(app)/attendance/generate/page.tsx`
*   **Acciones de Servidor Involucradas (de `src/lib/actions/attendanceActions.ts`):**
    *   `createAttendanceSession`: Para guardar una nueva sesión en Firestore cuando se "Inicia".
    *   `updateSessionStatus`: Para "Finalizar" una sesión activa o (potencialmente) "Reiniciar" una finalizada.
*   **Flujo de Trabajo:**
    1.  El usuario (Profesor/Admin) navega a esta página.
    2.  Ingresa un "Nombre de Curso/Título" para la sesión.
    3.  Automáticamente (o mediante un botón "Generate New Code"), se genera:
        *   Un `sessionId` único (usando `uuidv4`).
        *   Un `qrValue`, que es la URL completa: `[dominio-app]/attendance/mark/[sessionId]`.
    4.  Estos valores se muestran en el componente `QRCodeDisplay`.
    5.  El componente `QRCodeDisplay` (`src/components/attendance/QRCodeDisplay.tsx`):
        *   Muestra una imagen QR real (usando `qrcode.react`) codificando el `qrValue`.
        *   Muestra el `sessionId` en texto para entrada manual.
        *   Ofrece botones para copiar la URL y el ID de sesión.
    6.  **Iniciar Sesión:**
        *   El usuario hace clic en "Start New Attendance Session".
        *   Se llama a `createAttendanceSession` con los detalles de la sesión (incluyendo `courseName`, `teacherId` (del usuario logueado), `sessionId`, `qrValue`).
        *   La sesión se guarda en la colección `attendanceSessions` de Firestore con `active: true`.
        *   La UI se actualiza para indicar que la sesión está activa.
    7.  **Finalizar Sesión:**
        *   Si una sesión está activa, el botón cambia a "End Current Session".
        *   Al hacer clic, se llama a `updateSessionStatus(sessionId, false)`.
        *   El campo `active` de la sesión en Firestore se actualiza a `false`.
        *   La UI se actualiza. El profesor puede entonces generar un nuevo código para una futura sesión.
    8.  **Generar Nuevo Código (si la sesión no se ha iniciado):**
        *   Si la sesión actual (mostrada en la UI) no se ha "Iniciado", el botón "Generate New Code" permite descartar el `sessionId` y `qrValue` actuales y generar unos nuevos, sin interactuar con Firestore aún.
*   **Colección Firestore:** `attendanceSessions` (ver `06-firestore-structure.md`).

## 3.2. Marcar Asistencia

### 3.2.1. Página de Entrada de Código (`/attendance/mark`)

*   **Propósito:** Página inicial para que los estudiantes (o profesores que marcan su propia asistencia) ingresen el código de sesión.
*   **Componente Principal:** `src/app/(app)/attendance/mark/page.tsx`
*   **Flujo de Trabajo:**
    1.  El estudiante/profesor ingresa el `sessionId` (código de sesión) proporcionado.
    2.  Al hacer clic en "Proceed to Mark Attendance":
        *   Se realiza una validación opcional del lado del cliente llamando a `getAttendanceSession` para verificar si el código es válido y la sesión está activa. Esto proporciona retroalimentación rápida.
        *   Si la validación es exitosa (o se omite), el usuario es redirigido a la página dinámica `/attendance/mark/[sessionCodeInput]`.

### 3.2.2. Página de Marcado Específica de la Sesión (`/attendance/mark/[sessionId]`)

*   **Propósito:** Validar la sesión y permitir al usuario confirmar su asistencia.
*   **Componente Principal:** `src/app/(app)/attendance/mark/[sessionId]/page.tsx`
*   **Parámetro de Ruta:** `sessionId` (obtenido de la URL).
*   **Acciones de Servidor Involucradas:**
    *   `getAttendanceSession(sessionId)`: Para obtener detalles de la sesión y verificar su estado.
    *   `markStudentAttendance`: Para registrar la asistencia.
*   **Flujo de Trabajo:**
    1.  La página se carga con el `sessionId` de la URL.
    2.  `useEffect` llama a `getAttendanceSession(sessionId)` para:
        *   Verificar si la sesión existe.
        *   Verificar si la sesión está `active`.
        *   Obtener el `courseName` para mostrarlo.
    3.  Si la sesión no es válida o no está activa, se muestra un mensaje de error al usuario.
    4.  Si es válida, se muestra el nombre del curso y un botón "Confirm My Attendance".
    5.  Al hacer clic en el botón de confirmación:
        *   Se llama a `markStudentAttendance` con `sessionId`, `studentId` (del usuario logueado) y `studentName`.
        *   La acción del servidor:
            *   Vuelve a verificar que la sesión exista y esté activa.
            *   Verifica si el usuario ya ha marcado asistencia para esta sesión (consultando `attendanceRecords`).
            *   Si todo es correcto, crea un nuevo documento en la colección `attendanceRecords` con el `sessionId`, `studentId`, `studentName`, `timestamp` (del servidor) y `status: "present"`.
    6.  Se muestra un mensaje de éxito, error o información (si ya había marcado asistencia) al usuario.
*   **Colección Firestore:** `attendanceRecords` (ver `06-firestore-structure.md`).

## 3.3. Historial de Asistencia

### 3.3.1. Historial del Estudiante (`/student/my-attendance`)

*   **Propósito:** Permitir a los estudiantes ver su propio historial de asistencia.
*   **Componente Principal:** `src/app/(app)/student/my-attendance/page.tsx`
*   **Acción de Servidor:** `getStudentAttendanceHistory(studentId)`
*   **Flujo de Trabajo:**
    1.  Al cargar la página, se llama a `getStudentAttendanceHistory` con el UID del estudiante logueado.
    2.  La acción consulta la colección `attendanceRecords` por `studentId`, ordenado por fecha.
    3.  Para cada registro, obtiene el `courseName` de la sesión correspondiente en `attendanceSessions`.
    4.  Devuelve una lista de registros que se muestra en una tabla con "Nombre del Curso", "Fecha" y "Estado".

### 3.3.2. Historial del Profesor/Administrador (`/teacher/attendance-history`)

*   **Propósito:** Permitir a Profesores ver el historial de las sesiones que crearon y los asistentes. Administradores pueden ver todas las sesiones.
*   **Componente Principal:** `src/app/(app)/teacher/attendance-history/page.tsx`
*   **Acciones de Servidor:**
    *   `getTeacherAttendanceSessions(teacherId)`: Para obtener todas las sesiones creadas por el profesor (o todas si es admin, aunque la lógica actual filtra por `teacherId`).
    *   `getAttendanceRecordsForSession(sessionId)`: Para obtener los asistentes de una sesión específica.
    *   `updateSessionStatus(sessionId, active)`: Para finalizar o reiniciar sesiones desde esta vista.
*   **Flujo de Trabajo:**
    1.  Al cargar, se llama a `getTeacherAttendanceSessions` para obtener la lista de sesiones.
    2.  Las sesiones se muestran en un componente `Accordion` de ShadCN.
    3.  Cada `AccordionItem` representa una sesión y muestra su nombre, fecha de creación y estado (Activa/Finalizada).
    4.  Al expandir un acordeón (hacer clic en `AccordionTrigger`):
        *   Se llama a `fetchAttendeesForSession(sessionId)` (que a su vez llama a `getAttendanceRecordsForSession`).
        *   Se muestra una tabla con los asistentes: "Nombre del Estudiante", "Hora Marcada", "Estado".
    5.  Dentro del contenido del acordeón, hay un botón para "Finalizar Sesión" (si está activa) o "Reiniciar Sesión" (si está finalizada), que llama a `updateSessionStatus`.
