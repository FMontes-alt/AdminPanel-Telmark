# 🛡️ Sistema de Permisos Jerárquicos y Grupos

Este documento detalla la arquitectura técnica implementada para gestionar accesos avanzados, permitiendo la herencia de permisos a través de grupos ("Equipos") y la asignación individualizada.

---

## 🏗️ Modelo de Datos (Drizzle ORM)

El sistema se apoya en tres entidades principales que sustituyen al antiguo array de IDs en el perfil:

### 1. Grupos (`groups`)
Define conjuntos de usuarios.
- `id`: UUID (Primary Key)
- `name`: Nombre del grupo (ej: "Soporte Nivel 1")
- `description`: Descripción opcional.

### 2. Membresía (`user_groups`)
Tabla intermedia que conecta usuarios con grupos.
- `userId`: Relación con `profiles.id`.
- `groupId`: Relación con `groups.id`.

### 3. Permisos (`permissions`)
Tabla central que define qué objeto (`targetId`) de qué tipo (`targetType`) está asignado.
- `userId` (opcional): Si es un permiso **individual/especial**.
- `groupId` (opcional): Si es un permiso **heredado por grupo**.
- `targetType`: `section`, `category`, `subcategory` o `item`.
- `targetId`: UUID del objeto destino.

---

## 🔒 Lógica de Herencia e Interfaz

La gran mejora del sistema es la **herencia inteligente**. Un usuario tiene acceso si:
1. Tiene el permiso asignado **directamente** (Individual).
2. Pertenece a un **Grupo** que tiene ese permiso.
3. El **Padre** (ej: la sección) del elemento está asignado (Cascada).

### 🛡️ UI: PermissionSelector ("Shield Icon")
En el panel de administración, los permisos heredados se visualizan con un **icono de escudo** y están bloqueados (`non-interactive`):
- Previene la creación de permisos manuales redundantes.
- El cursor cambia a `default` y la opacidad se reduce al 80%.
- Muestra una etiqueta de "Equipo" para indicar el origen del acceso.

---

## 🚀 Optimización de Rendimiento

Para evitar el problema de "N+1 consultas" al cargar el Dashboard, se implementó una **Resolución Agrupada** en `getDashboardData`:

1. Se recuperan todos los IDs de permisos (Directos + Grupos) en una sola consulta SQL.
2. Se agrupan los IDs por tipo (`targetType`).
3. Se lanzan consultas `IN ARRAY` masivas para resolver los nombres y slugs.
4. Se reconstruye el árbol de navegación final de forma eficiente.

---

## 🔄 Estrategia de Caché y Consistencia

Dada la naturaleza crítica de los permisos, se implementó una invalidación de caché agresiva:
- Cualquier mutación (crear/editar/borrar agentes o grupos) dispara:
  ```typescript
  revalidatePath("/", "layout");
  ```
- Esto garantiza que los cambios en el panel de administración impacten **instantáneamente** en el Dashboard del usuario final, sin esperas de caché.

---

## 📖 Archivos Clave para Referencia
- **Esquema DB**: [schema.ts](file:///c:/Users/Fran/Desktop/AdminPanel-Telmark/src/db/schema.ts)
- **Acciones Usuario/Dashboard**: [users.ts](file:///c:/Users/Fran/Desktop/AdminPanel-Telmark/src/actions/users.ts)
- **Acciones Grupos**: [groups.ts](file:///c:/Users/Fran/Desktop/AdminPanel-Telmark/src/actions/groups.ts)
- **Lógica Jerarquía**: [permissions.ts](file:///c:/Users/Fran/Desktop/AdminPanel-Telmark/src/actions/permissions.ts)
- **Selector UI**: [PermissionSelector.tsx](file:///c:/Users/Fran/Desktop/AdminPanel-Telmark/src/app/admin/components/PermissionSelector.tsx)

---

> [!TIP]
> Al migrar usuarios antiguos, el sistema es retrocompatible: si detecta `assigned_section_ids` todavía poblado, lo une a los nuevos permisos hasta que el perfil es actualizado mediante el panel administrativo.
