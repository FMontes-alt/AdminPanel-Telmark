# 👥 Gestión de Empleados y Redirección Dinámica

Este módulo permite la administración centralizada de los accesos de los empleados y automatiza su redirección a las secciones correspondientes tras el inicio de sesión.

---

## 🏗️ Arquitectura de Datos

Se ha simplificado el modelo relacional para mejorar el rendimiento y la mantenibilidad.

- **Tabla**: `profiles`
- **Cambio**: Se eliminó la tabla intermedia `profile_sections`.
- **Implementación**: Atributo `assigned_section_ids` tipo `UUID Array` nativo de PostgreSQL.
- **Drizzle Schema**:
  ```typescript
  assignedSectionIds: uuid("assigned_section_ids").array()
  ```

---

## 🔑 Flujo de Acceso (Smart Redirection)

La aplicación utiliza una lógica de enrutamiento dinámico en el punto de entrada principal (`src/app/page.tsx`).

### Estados de Redirección:

1. **Administrador (`admin` / `superadmin`)**:
   - Envío directo a `/admin`.
2. **Empleado con 1 Sección**:
   - Redirección automática a su dashboard específico: `/dashboard/[slug]`.
3. **Empleado con Múltiples Secciones**:
   - Envío a la página de selección: `/dashboard`.
4. **Empleado sin Secciones**:
   - Visualización de pantalla de bloqueo con instrucciones de contacto.

---

## 🛠️ Panel de Administración (`/admin/agents`)

Interfaz premium para que los administradores gestionen la nómina de accesos.

### Funcionalidades:
- **Alta de Usuarios**: Creación automática en Supabase Auth y sincronización con el perfil de Base de Datos.
- **Asignación Visual**: Selección de secciones mediante botones interactivos (toggle).
- **Seguridad**: Uso de `SERVICE_ROLE_KEY` en el servidor para evitar procesos de confirmación de email innecesarios en entornos corporativos.

---

## 🚪 Sistema de Logout

Se implementó un componente especializado `LogoutButton` que garantiza la limpieza de la sesión en:
1. El cliente (Supabase Auth).
2. El servidor (Cookies).
3. El estado de Next.js (Router Refresh).

---

> [!IMPORTANT]
> Las secciones asignadas se almacenan como arrays de UUIDs. Al realizar cambios en el esquema, asegúrate de ejecutar `npx drizzle-kit push` para sincronizar con la base de datos de Supabase.
