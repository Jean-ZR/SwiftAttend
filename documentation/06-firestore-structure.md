# 6. Estructura de Firebase Firestore

Firebase Firestore es la base de datos NoSQL utilizada por SwiftAttend para almacenar y gestionar todos los datos persistentes de la aplicación. A continuación, se detalla la estructura de las colecciones principales.

## 6.1. Colección `users`

*   **Propósito:** Almacena la información del perfil de cada usuario registrado en el sistema.
*   **ID del Documento:** `uid` del usuario (el mismo `uid` proporcionado por Firebase Authentication).
*   **Campos por Documento:**
    *   `uid` (string): El identificador único del usuario. Clave primaria.
    *   `email` (string): La dirección de correo electrónico del usuario. Utilizada para el inicio de sesión.
    *   `displayName` (string): El nombre completo o preferido del usuario para mostrar en la interfaz.
    *   `role` (string): Define los permisos y el tipo de acceso del usuario. Valores posibles:
        *   `"admin"`: Administrador del sistema.
        *   `"teacher"`: Profesor o instructor.
        *   `"student"`: Estudiante o participante.
    *   `createdAt` (Timestamp): La fecha y hora en que se creó el perfil del usuario en Firestore. Se establece usando `serverTimestamp()`.

## 6.2. Colección `attendanceSessions`

*   **Propósito:** Almacena la información de cada sesión de asistencia creada por un profesor o administrador.
*   **ID del Documento:** `sessionId` (string). Un UUID v4 generado en el cliente cuando se crea una nueva sesión, antes de ser "iniciada".
*   **Campos por Documento:**
    *   `teacherId` (string): El `uid` del usuario (profesor o administrador) que creó y es propietario de la sesión.
    *   `courseName` (string): El nombre o título descriptivo de la sesión de asistencia (ej: "Matemáticas 101 - Clase #5", "Reunión Semanal Equipo Alfa").
    *   `createdAt` (Timestamp): La fecha y hora en que se creó e "inició" la sesión en Firestore.
    *   `active` (boolean): Indica si la sesión está actualmente activa y aceptando registros de asistencia.
        *   `true`: La sesión está en curso.
        *   `false`: La sesión ha finalizado.
    *   `qrCodeValue` (string): La URL completa que se codifica en el código QR (y que el ID de sesión representa). Típicamente en el formato: `https://[dominio-app]/attendance/mark/[sessionId]`.
    *   `attendees` (array de strings, opcional): Podría usarse para almacenar un resumen rápido de los `studentId` que han asistido, aunque la fuente principal y más detallada de registros de asistencia es la colección `attendanceRecords`. Actualmente está inicializado como un array vacío y no se usa activamente para poblarlo con UIDs.

## 6.3. Colección `attendanceRecords`

*   **Propósito:** Almacena cada instancia individual de un estudiante (o profesor) marcando su asistencia para una sesión específica.
*   **ID del Documento:** Autogenerado por Firestore (un ID único aleatorio).
*   **Campos por Documento:**
    *   `sessionId` (string): El ID de la `attendanceSession` a la que pertenece este registro de asistencia. Usado para enlazar el registro con la sesión.
    *   `studentId` (string): El `uid` del usuario (estudiante o profesor) que marcó la asistencia.
    *   `studentName` (string): El `displayName` del usuario que marcó la asistencia. Se almacena para facilitar la visualización en historiales sin necesidad de hacer una consulta adicional a la colección `users`.
    *   `timestamp` (Timestamp): La fecha y hora exactas en que se registró la asistencia. Se establece usando `serverTimestamp()`.
    *   `status` (string): El estado de la asistencia. Actualmente, el valor principal es `"present"`. Podría expandirse en el futuro (ej: `"absent"`, `"late"`), aunque requeriría lógica adicional.

## 6.4. Índices de Firestore

Para optimizar las consultas, especialmente aquellas que involucran filtros y ordenamiento en diferentes campos, se requieren índices compuestos. Un ejemplo crítico es:

*   **Colección:** `attendanceSessions`
    *   **Campos:**
        1.  `teacherId` (Ascendente)
        2.  `createdAt` (Descendente)
    *   **Propósito:** Permite a los profesores (y administradores que ven todas las sesiones de un profesor) obtener eficientemente sus sesiones ordenadas por fecha de creación. Sin este índice, la consulta en `getTeacherAttendanceSessions` fallaría o sería muy ineficiente.

Es crucial monitorear los mensajes de error de Firestore en la consola del servidor/navegador, ya que a menudo proporcionan enlaces directos para crear índices faltantes.
