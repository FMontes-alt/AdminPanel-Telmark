# Documentación: EPIC 3 - Portal de Acceso Administrativo (Login)

Esta guía documenta los cambios y la arquitectura implementada en la rama `feature/login-page` para completar el sistema de autenticación del **EPIC 3**.

## 1. Objetivo Alcanzado
Se ha construido la interfaz gráfica de inicio de sesión (`/login`) y el punto de entrada al panel de control (`/admin`), conectándolos de forma segura con el **Middleware de Supabase** (previamente configurado). 

El sistema ahora requiere credenciales válidas generadas en la consola de Supabase (Email y Contraseña) para permitir el acceso a las rutas protegidas.

> [!WARNING]
> Las restricciones de acceso basadas en Roles (RBAC) están actualmente **desactivadas** en el Middleware para facilitar el desarrollo. Todos los usuarios autenticados tienen acceso total al panel por el momento.

## 2. Dependencias Añadidas
Para lograr un diseño premium se han instalado las siguientes herramientas:
- **`framer-motion`**: Para dotar a la UI de animaciones fluidas y en cascada (*staggered animations*).
- **`react-hook-form` & `zod`**: Para la construcción y validación estricta del formulario en tiempo real, evitando peticiones innecesarias al servidor.
- **Componentes de `shadcn/ui`**: `form`, `input`, `button`, `card`, `label`, `alert`.

## 3. Arquitectura de Archivos

### Frontend (User Interface)
- **`src/app/login/page.tsx`**: Contiene la interfaz de inicio de sesión. Muestra un diseño luminoso (*Light Theme*) que respeta la paleta cromática de Telmark (Azul, Morado, Naranja y Teal). Captura los errores de autenticación y los muestra mediante Alertas enriquecidas.
- **`src/app/admin/page.tsx`**: Pantalla inicial tras un acceso exitoso. Sirve como anclaje visual (evita el Error 404 de Next.js) e incluye un botón funcional para **Cerrar Sesión**.

### Backend (Server Actions)
Se utilizan *Server Actions* de Next.js para ocultar la lógica de negocio al cliente y gestionar las "cookies" a nivel servidor de forma segura:

- **`src/app/login/actions.ts`**: Expone la función `login(formData)`. Valida la información, se conecta al cliente `createServerClient` de Supabase SSR y ejecuta `signInWithPassword()`. Si las credenciales son válidas, Supabase guarda la cookie y el propio Middleware da luz verde para redirigir a `/admin`.
- **`src/app/admin/actions.ts`**: Expone la función `logout()`. Se conecta al SSR de Supabase e invoca `signOut()`, vaciando la sesión activa y provocando la expulsión del usuario al `/login`.

## 4. Flujo de Trabajo (Para el equipo de desarrollo)
1. **Verificar Configuración**: Asegurar en la consola de Supabase (**Authentication > Providers**) que el acceso mediante `Email` está habilitado.
2. **Crear Usuarios Híbridos**: Ya que se ha suprimido el seeder de `profiles` por la dependencia con las tablas abstractas de `auth.users`, los perfiles iniciales deberán crearse manualmente desde el panel oficial de Supabase.
3. **Siguientes Pasos (EPIC 4 & 7)**: El sistema de barreras está implementado. El equipo puede comenzar a desarrollar los clientes universales de Supabase (Server/Browser) e iniciar la maquetación del *Layout* interno del panel en la ruta `/admin`.

---

## 🗺️ Navegación: Guías
- 🔙 **[Volver al Hub](../INDEX.md)**
- 🚀 **[Setup inicial](setup.md)**
- 🔐 **[Seguridad y RLS](../architecture/security-rls.md)**

*Última actualización: 2026-03-24*
