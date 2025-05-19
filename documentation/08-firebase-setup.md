# 8. Configuración de Firebase y Variables de Entorno

Este documento explica cómo configurar tu proyecto de Firebase y obtener las credenciales necesarias para que la aplicación SwiftAttend funcione correctamente.

## 8.1. Crear un Proyecto en Firebase

Si aún no tienes un proyecto de Firebase:

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Haz clic en "**Añadir proyecto**" (o "Crear un proyecto").
3.  Sigue las instrucciones en pantalla para nombrar tu proyecto y configurar las opciones iniciales (puedes habilitar o deshabilitar Google Analytics según prefieras).
4.  Una vez creado el proyecto, serás redirigido al panel de control del proyecto.

## 8.2. Registrar tu Aplicación Web

Dentro de tu proyecto de Firebase:

1.  En el panel de control del proyecto, busca el icono **</>** (Web) para añadir una aplicación web. Si no lo ves inmediatamente, puede estar bajo "Empezar a añadir Firebase a tu aplicación".
2.  Asígnale un **alias** a tu aplicación (ej: "SwiftAttend Web App").
3.  **No** es necesario marcar la casilla "Configura también Firebase Hosting para esta aplicación" a menos que planees usar Firebase Hosting específicamente para desplegar esta aplicación (Next.js a menudo se despliega en otras plataformas como Vercel).
4.  Haz clic en "**Registrar aplicación**".

## 8.3. Obtener las Credenciales de Firebase (Configuración del SDK)

Después de registrar la aplicación, Firebase te mostrará la configuración del SDK. Verás un objeto JavaScript similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc...",
  measurementId: "G-XYZ..." // Opcional
};
```

Estos son los valores que necesitas para tu aplicación.

Si ya registraste la aplicación y necesitas encontrar estas credenciales de nuevo:
1.  Ve a la "Configuración del proyecto" (el icono de engranaje cerca de "Project Overview").
2.  En la pestaña "General", desplázate hacia abajo hasta la sección "Tus apps".
3.  Busca tu aplicación web y haz clic en el icono de engranaje junto a ella o selecciona "Configuración del SDK" (o similar, la interfaz de Firebase puede cambiar).
4.  Deberías ver la `firebaseConfig` allí.

## 8.4. Configurar Variables de Entorno

Para mantener tus credenciales seguras y no subirlas directamente al código fuente (especialmente a repositorios públicos), usamos variables de entorno.

1.  **Crea un archivo `.env.local`**:
    En la raíz de tu proyecto SwiftAttend, crea un archivo llamado `.env.local`.
2.  **Copia el contenido de `.env.local.example`**:
    Este proyecto incluye un archivo llamado `.env.local.example` que sirve como plantilla:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID (Opcional)
    ```
3.  **Pega y Modifica**:
    Copia el contenido de `.env.local.example` en tu nuevo archivo `.env.local`.
    Reemplaza los valores `YOUR_...` con las credenciales correspondientes que obtuviste de la `firebaseConfig` de tu proyecto Firebase.

    Ejemplo de cómo se vería tu `.env.local` (con credenciales ficticias):
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourActualApiKey...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-swiftattend.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-swiftattend
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-swiftattend.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
    NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-MYMEASUREMENTID (Si lo tienes)
    ```

## 8.5. Habilitar Servicios de Firebase

Asegúrate de que los servicios que SwiftAttend utiliza estén habilitados en tu proyecto Firebase:

1.  **Authentication**:
    *   Ve a la sección "Authentication" en el menú lateral de la consola de Firebase.
    *   Haz clic en "Comenzar".
    *   En la pestaña "Sign-in method", habilita el proveedor "Correo electrónico/Contraseña".
2.  **Firestore Database**:
    *   Ve a la sección "Firestore Database" en el menú lateral.
    *   Haz clic en "Crear base de datos".
    *   Elige iniciar en **modo de producción** (recomendado para seguridad, luego ajusta las reglas). O en **modo de prueba** si estás desarrollando (recuerda que las reglas del modo de prueba permiten acceso abierto durante 30 días).
    *   Selecciona una ubicación para tu base de datos.
    *   Una vez creada, necesitarás configurar las **Reglas de Seguridad** de Firestore para permitir las operaciones que la aplicación necesita (ver `06-firestore-structure.md` para una idea de las colecciones, y ajusta las reglas según sea necesario). Por ahora, para empezar, podrías usar reglas permisivas y luego restringirlas:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if request.auth != null; // Ejemplo: permite leer/escribir si está autenticado
            }
          }
        }
        ```
        **¡Importante!** Estas reglas son solo un ejemplo básico. Deberías ajustarlas para que sean más seguras y específicas para tu aplicación.

## 8.6. .gitignore

El archivo `.env.local` contiene información sensible y **NO** debe ser subido a tu repositorio Git. Asegúrate de que la línea `*.env*.local` (o similar) esté presente en tu archivo `.gitignore` en la raíz del proyecto. Si no está, añádela:

```
# Local environment variables
.env*.local
```
Esto evitará que cualquier archivo que termine en `.env.local` (o `.env.development.local`, etc.) sea rastreado por Git.

Una vez completados estos pasos, tu aplicación SwiftAttend debería poder conectarse a tu proyecto Firebase. Recuerda reiniciar tu servidor de desarrollo Next.js después de crear o modificar el archivo `.env.local` para que las variables de entorno se carguen correctamente.
