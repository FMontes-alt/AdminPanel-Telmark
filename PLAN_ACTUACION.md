# Plan de Actuación Post-Auditoría — AdminPanel-Telmark

**Contexto**: Basado en la auditoría técnica (`AUDITORIA.md`), este plan divide el trabajo en **5 Work Packages (WP) independientes** para ejecución paralela por diferentes IAs.

**Exclusión**: Todo lo relacionado con **quizzes** queda fuera (sistema sin terminar).

> [!IMPORTANT]
> Cada WP tiene su **scope de archivos** definido. Las IAs no deben tocar archivos fuera de su scope para evitar conflictos de merge.

---

## Work Package 1 — Seguridad del Backend

**Objetivo**: Cerrar las vulnerabilidades de seguridad detectadas en Server Actions y middleware.

**Archivos que toca** (exclusivos):
- `src/middlewares/auth.ts`
- `src/actions/users.ts` (solo funciones `getAgents`, `getAgentById`)
- `src/actions/storage.ts` (solo funciones `getSignedUrlAction`, `getDownloadUrlAction`)
- `src/actions/groups.ts` (solo funciones `getGroups`, `getGroupById`)

### Tareas

#### 1.1 Proteger `/dashboard` en el middleware
- En `src/middlewares/auth.ts`, añadir protección para rutas `/dashboard`:
  - Si `isDashboardRoute && !user` → redirect a `/login`
  - No tocar la lógica de admin existente

#### 1.2 Proteger lecturas sensibles con `requireAdmin()`
- `getAgents()` en `users.ts` → añadir `await requireAdmin()` al inicio
- `getAgentById()` en `users.ts` → añadir `await requireAdmin()` al inicio
- `getGroups()` en `groups.ts` → añadir `await requireAdmin()` al inicio (ya importa `requireAdmin`)
- `getGroupById()` en `groups.ts` → añadir `await requireAdmin()` al inicio

#### 1.3 Proteger URLs firmadas de Storage
- `getSignedUrlAction()` en `storage.ts` → añadir verificación de que el usuario actual tiene acceso al path solicitado (comprobar que es admin o que el path corresponde a una sección asignada al usuario). Como mínimo, verificar que hay sesión activa (`getCurrentUser()`).
- `getDownloadUrlAction()` → misma protección.

### Criterios de aceptación
- [ ] Un usuario no autenticado que accede a `/dashboard` es redirigido a `/login`
- [ ] Un usuario con rol `usuario` no puede llamar a `getAgents()` sin error
- [ ] `getSignedUrlAction` verifica sesión activa antes de generar la URL
- [ ] No se rompe la funcionalidad existente del dashboard para usuarios autenticados

### Instrucciones para la IA
```
Lee AUDITORIA.md para contexto. Ejecuta solo las tareas de WP1. 
No toques archivos fuera del scope. El sistema de quizzes está sin terminar, 
ignóralo completamente. Después de hacer los cambios, verifica que el 
proyecto compila con `npm run build`.
```

---

## Work Package 2 — Refactorización del Frontend

**Objetivo**: Migrar páginas de `"use client"` a Server Components donde sea posible y dividir componentes monolíticos.

**Archivos que toca** (exclusivos):
- `src/app/admin/sections/page.tsx`
- `src/app/admin/usuarios/page.tsx`
- `src/app/admin/grupos/page.tsx`
- `src/app/admin/components/Sidebar.tsx`
- `src/app/admin/usuarios/AgentForm.tsx`
- Puede crear nuevos archivos dentro de estos directorios

> [!WARNING]
> **NO tocar** `src/app/admin/quizzes/`, `src/app/dashboard/`, `src/actions/`, `src/middlewares/`, ni `src/lib/`. Solo frontend de admin (excepto quizzes).

### Tareas

#### 2.1 Migrar páginas admin a Server Components
Para cada página (`sections/page.tsx`, `usuarios/page.tsx`, `grupos/page.tsx`):
1. Quitar `"use client"` de la página principal
2. Mover la carga de datos (`getAgents()`, `getAllSectionsAction()`, `getGroups()`) al Server Component
3. Extraer la parte interactiva (filtros, modales, formularios) a un componente hijo `"use client"` que reciba los datos por props
4. Patrón a seguir:
```tsx
// page.tsx (Server Component - SIN "use client")
import { getAgents } from "@/actions/users"
import { AgentsClient } from "./AgentsClient"

export default async function UsuariosPage() {
    const agents = await getAgents()
    return <AgentsClient initialAgents={agents} />
}

// AgentsClient.tsx (Client Component)
"use client"
export function AgentsClient({ initialAgents }: { initialAgents: Agent[] }) {
    // Toda la interactividad aquí
}
```

#### 2.2 Dividir Sidebar.tsx (12KB)
Dividir `Sidebar.tsx` en componentes más pequeños:
- `SidebarNav.tsx` — Lista de enlaces de navegación
- `SidebarFooter.tsx` — Zona inferior (logout, info del usuario)
- `SidebarLogo.tsx` — Logo y branding
- `Sidebar.tsx` — Composición de los anteriores

#### 2.3 Dividir AgentForm.tsx (20KB)
Dividir `AgentForm.tsx` en secciones:
- `AgentBasicFields.tsx` — Campos básicos (nombre, email, teléfono, rol)
- `AgentGroupSelector.tsx` — Selector de grupos
- `AgentPermissions.tsx` — Selector de permisos individuales
- `AgentForm.tsx` — Orquestador que compone las secciones

### Criterios de aceptación
- [ ] Las páginas de admin cargan datos en servidor (sin spinner inicial)
- [ ] La funcionalidad de cada página se mantiene intacta (CRUD, filtros, modales)
- [ ] Sidebar muestra la misma información y animaciones que antes
- [ ] AgentForm sigue funcionando para crear y editar usuarios
- [ ] El proyecto compila sin errores (`npm run build`)

### Instrucciones para la IA
```
Lee AUDITORIA.md sección 5.1 para contexto. Este WP es solo frontend. 
No modifiques Server Actions ni lógica de backend. El objetivo es reducir 
"use client" y dividir componentes grandes. Mantén todas las animaciones 
y estilos existentes. NO toques nada de quizzes ni dashboard de empleados. 
Verifica con `npm run build`.
```

---

## Work Package 3 — Estandarización del Backend

**Objetivo**: Unificar patrones de código en Server Actions: retornos, error handling, tipos, y limpieza de `console`.

**Archivos que toca** (exclusivos):
- `src/actions/sections.ts`
- `src/actions/categories.ts`
- `src/actions/subcategories.ts`
- `src/actions/items.ts`
- `src/actions/alerts.ts`
- `src/actions/hierarchy.ts`
- `src/actions/bulk-actions.ts`
- `src/lib/error-handler.ts`
- `src/lib/types/campaing-builder.ts` → renombrar a `campaign-builder.ts`
- Puede crear `src/lib/types/actions.ts` (nuevo)
- Puede crear `src/lib/logger.ts` (nuevo)

> [!WARNING]
> **NO tocar** `users.ts`, `groups.ts`, `permissions.ts`, `storage.ts` (son de WP1), ni nada de `quiz*.ts` (excluido). No tocar `auth.ts` (no necesita cambios).

### Tareas

#### 3.1 Crear tipo estándar de retorno para Actions
Crear `src/lib/types/actions.ts`:
```typescript
export type ActionResult<T = void> = 
    | { success: true; data: T }
    | { success: false; error: string }
```

#### 3.2 Estandarizar retornos de Server Actions
Aplicar `ActionResult<T>` a todas las funciones de escritura (create, update, delete) en los archivos del scope. Ejemplo:
```typescript
// ANTES
export async function createSection(data: CreateSectionInput) {
    await requireAdmin()
    const [newSection] = await db.insert(sections)...
    return newSection  // Retorno directo sin envolver
}

// DESPUÉS
export async function createSection(data: CreateSectionInput): Promise<ActionResult<typeof sections.$inferSelect>> {
    try {
        await requireAdmin()
        const [newSection] = await db.insert(sections)...
        return { success: true, data: newSection }
    } catch (error) {
        return { success: false, error: formatError(error).message }
    }
}
```

#### 3.3 Unificar error handling
- Todas las actions deben usar `formatError()` de `src/lib/error-handler.ts`
- Eliminar los `catch (error: any)` con acceso directo a `error.message`
- Mejorar `formatError()` para manejar errores de Drizzle (constraint violations, etc.)

#### 3.4 Reemplazar `as any` por tipos correctos
En los archivos del scope:
- `sections.ts` L64, L117, L118: Crear interfaz `SectionConfig` para el campo `config` JSONB
- `bulk-actions.ts` L52, L69, L103: Tipar arrays y errors correctamente

#### 3.5 Reemplazar `console.*` por logger
- Crear `src/lib/logger.ts` con funciones `log.info()`, `log.error()`, `log.warn()` que:
  - En desarrollo: imprimen con prefijo y timestamp
  - En producción: podrían enviarse a un servicio externo (preparar la interfaz)
- Reemplazar `console.error` en los archivos del scope por `log.error`

#### 3.6 Renombrar archivo con typo
- `src/lib/types/campaing-builder.ts` → `src/lib/types/campaign-builder.ts`
- Actualizar todos los imports que referencien el archivo antiguo

### Criterios de aceptación
- [ ] Todas las Server Actions del scope retornan `ActionResult<T>`
- [ ] Cero instancias de `as any` en los archivos del scope
- [ ] Cero instancias de `console.error/log` directos en actions del scope (usar logger)
- [ ] `formatError()` maneja errores de Drizzle
- [ ] El typo `campaing` está corregido en archivo y todos sus imports
- [ ] `npm run build` compila sin errores
- [ ] Los componentes del frontend que consumen estas actions siguen funcionando

### Instrucciones para la IA
```
Lee AUDITORIA.md secciones 5.2 para contexto. Este WP es solo backend.
Los archivos de users.ts, groups.ts, permissions.ts y storage.ts son 
de otro WP, no los toques. Todo lo de quiz*.ts está excluido. 
Si cambias el formato de retorno de una action, busca dónde se consume 
en el frontend y adapta el manejo del resultado. Verifica con `npm run build`.
```

---

## Work Package 4 — Testing

**Objetivo**: Crear una base de tests automatizados para el proyecto.

**Archivos que toca** (exclusivos):
- `test/` (todo el directorio)
- `vitest.config.ts`
- Puede crear `test/setup.ts`
- Puede crear archivos en `test/unit/`, `test/integration/`

> [!WARNING]
> **NO modificar** ningún archivo fuente en `src/`. Solo crear tests. Si un test falla por un bug real, documentarlo en un comentario `// BUG:` dentro del test, pero no arreglar el código fuente.

### Tareas

#### 4.1 Configurar infraestructura de tests
- Crear `test/setup.ts` con:
  - Mocks globales de Supabase (`@supabase/ssr`)
  - Mocks de `next/headers` (cookies)
  - Mocks de `next/cache` (revalidatePath)
  - Variables de entorno de test
- Actualizar `vitest.config.ts` para usar `setupFiles: ['./test/setup.ts']`
- Organizar en carpetas: `test/unit/`, `test/integration/`

#### 4.2 Tests del Middleware
Actualizar `test/middleware.test.ts`:
- Fix: Cambiar import de `@/middleware` a `@/proxy` (o el export correcto)
- Añadir tests:
  - Usuario anónimo en `/admin` → redirect a `/login`
  - Usuario anónimo en `/dashboard` → redirect a `/login`
  - Usuario admin en `/admin` → pasa (200)
  - Usuario normal en `/admin` → redirect a `/`
  - Home (`/`) → pasa (200)
  - Headers de seguridad presentes (CSP, X-Frame-Options, etc.)
  - Modo mantenimiento activado → redirect a `/maintenance`
  - Trace ID presente en headers de respuesta

#### 4.3 Tests del Auth Guard
Crear `test/unit/auth-guard.test.ts`:
- `getCurrentUser()` sin sesión → retorna null
- `getCurrentUser()` con sesión válida → retorna user + profile
- `requireAdmin()` con rol usuario → lanza excepción
- `requireAdmin()` con rol admin → retorna auth
- `requireSuperAdmin()` con rol admin → lanza excepción
- `requireSuperAdmin()` con rol superadmin → retorna auth

#### 4.4 Tests de Server Actions (CRUD Secciones)
Crear `test/unit/actions/sections.test.ts`:
- Mock de `db` y `requireAdmin`
- `getAllSectionsAction()` → retorna array de secciones
- `createSection()` → llama a requireAdmin, inserta en DB, retorna sección
- `deleteSection()` → llama a requireAdmin, limpia storage, borra de DB
- `createSection()` sin auth → lanza error

#### 4.5 Tests de utilidades
Crear `test/unit/utils.test.ts`:
- `formatError(new Error("test"))` → `{ message: "test" }`
- `formatError("string error")` → `{ message: "string error" }`
- `formatError(42)` → `{ message: "Ha ocurrido un error inesperado." }`
- `sanitizeFileName("Mi Archivo (1).pdf")` → resultado sin espacios/tildes con timestamp
- `getStoragePath(...)` → formato correcto `section/cat/subcat/file`

### Criterios de aceptación
- [ ] `npm run test` ejecuta al menos 20 tests
- [ ] Tests del middleware cubren los 8 escenarios listados
- [ ] Tests del auth-guard cubren los 6 escenarios listados
- [ ] Tests de utilidades cubren los 5 escenarios listados
- [ ] Ningún test hace llamadas reales a Supabase o PostgreSQL (todo mockeado)
- [ ] Los tests pasan en CI sin variables de entorno reales

### Instrucciones para la IA
```
Lee AUDITORIA.md sección 4 para contexto. Solo crea tests, NO modifiques 
código fuente. Si un test revela un bug, documéntalo con un comentario 
// BUG: descripción, pero deja el test como .skip() para que no falle el CI.
No escribas tests de quizzes (sistema sin terminar). 
Ejecuta `npm run test` y verifica que todos los tests pasan.
```

---

## Work Package 5 — Estructura y Documentación

**Objetivo**: Limpiar la estructura del proyecto, corregir naming y mejorar la documentación.

**Archivos que toca** (exclusivos):
- `README.md`
- `src/app/layout.tsx` (solo cambiar `lang="en"` a `lang="es"`)
- `docs/` (todo el directorio — reorganizar)
- `diario_practicas.html` → mover a `docs/project/`
- `historial_git.csv` → mover a `docs/project/`
- `jira_tasks.csv` → mover a `docs/project/`
- `lint_output.txt` → añadir a `.gitignore` o borrar
- `project_context.md` → mover a `docs/project/`

> [!WARNING]
> **NO tocar** código fuente en `src/` (excepto el `lang` del layout). NO tocar `src/actions/`, `src/middlewares/`, `src/components/`, `src/db/`. Solo documentación y estructura de archivos.

### Tareas

#### 5.1 Fix `lang="en"` → `lang="es"`
- En `src/app/layout.tsx` línea 26: cambiar `<html lang="en">` a `<html lang="es">`

#### 5.2 Mover archivos sueltos de la raíz
```
diario_practicas.html → docs/project/diario_practicas.html
historial_git.csv → docs/project/historial_git.csv
jira_tasks.csv → docs/project/jira_tasks.csv
project_context.md → docs/project/project_context.md
lint_output.txt → BORRAR (y añadir lint_output.txt a .gitignore)
```

#### 5.3 Reorganizar docs sueltos
Mover los `.md` sueltos en `docs/` a subcarpetas lógicas:
```
docs/FIX_AUTH_RLS.md → docs/fixes/FIX_AUTH_RLS.md
docs/GUIA_SEGURIDAD.md → docs/guides/GUIA_SEGURIDAD.md
docs/SUPABASE_STORAGE_GUIDE.md → docs/guides/SUPABASE_STORAGE_GUIDE.md
docs/SISTEMA_CUESTIONARIOS.md → docs/features/SISTEMA_CUESTIONARIOS.md
docs/MULTIMEDIA_RESOURCES.md → docs/features/MULTIMEDIA_RESOURCES.md
docs/VISOR_INLINE_ACTUALIZACION.md → docs/fixes/VISOR_INLINE_ACTUALIZACION.md
docs/MEJORA_DESCARGAS_ENLACES.md → docs/fixes/MEJORA_DESCARGAS_ENLACES.md
docs/ARQUITECTURA_MODULAR_QUIZZES.md → docs/architecture/ARQUITECTURA_MODULAR_QUIZZES.md
docs/INFORME_ARQUITECTURA.md → docs/architecture/INFORME_ARQUITECTURA.md
```
- Actualizar `docs/INDEX.md` para reflejar las nuevas rutas
- Actualizar enlaces internos entre documentos si los hay

#### 5.4 Expandir README.md
Reescribir `README.md` con:
- Descripción del proyecto (qué es, para quién)
- Stack tecnológico (Next.js 16, React 19, Supabase, Drizzle, TailwindCSS 4)
- Quick start (instalación, variables de entorno, `npm run dev`)
- Estructura del proyecto (resumen de 10 líneas)
- Scripts disponibles (`npm run dev`, `test`, `seed`, `build`, etc.)
- Enlace a la documentación completa (`docs/INDEX.md`)

#### 5.5 Crear docs/guides/testing.md
Documentar:
- Cómo ejecutar tests (`npm run test`)
- Estructura de la carpeta `test/`
- Cómo escribir un nuevo test
- Mocks disponibles

#### 5.6 Crear docs/guides/deployment.md
Documentar:
- Variables de entorno necesarias (lista completa)
- Pasos de deploy a Vercel
- Configuración de Supabase (buckets, RLS, auth providers)

### Criterios de aceptación
- [ ] No hay archivos `.csv`, `.html` ni `lint_output.txt` en la raíz del proyecto
- [ ] `docs/INDEX.md` refleja la nueva estructura de archivos
- [ ] README.md tiene mínimo 50 líneas con toda la info necesaria para un nuevo dev
- [ ] `<html lang="es">` en el root layout
- [ ] Todos los enlaces internos en docs funcionan (no hay broken links)

### Instrucciones para la IA
```
Lee AUDITORIA.md secciones 6 y 7 para contexto. Este WP es solo estructura 
y documentación. NO modifiques código fuente (excepto lang="es" en layout.tsx). 
Mueve archivos con git mv para mantener historial. Verifica que todos los 
enlaces en docs/INDEX.md apuntan a archivos que existen.
```

---

## Orden de Ejecución Recomendado

Los WPs son independientes y pueden ejecutarse en **paralelo**, pero si hay que priorizar:

```
Paralelo 1 (CRÍTICO):    WP1 (Seguridad) + WP4 (Testing)
Paralelo 2 (IMPORTANTE): WP2 (Frontend) + WP3 (Backend)
Paralelo 3 (LIMPIEZA):   WP5 (Estructura y Docs)
```

## Verificación Final

Después de mergear todos los WPs, ejecutar:
```bash
npm run build      # Compilación sin errores
npm run test       # Todos los tests pasan
npm run lint       # Sin errores de lint
```

---

## Tabla Resumen de Conflictos

| Archivo | WP1 | WP2 | WP3 | WP4 | WP5 |
|---------|-----|-----|-----|-----|-----|
| `src/middlewares/auth.ts` | ✏️ | | | | |
| `src/actions/users.ts` | ✏️ | | | | |
| `src/actions/storage.ts` | ✏️ | | | | |
| `src/actions/groups.ts` | ✏️ | | | | |
| `src/actions/sections.ts` | | | ✏️ | | |
| `src/actions/categories.ts` | | | ✏️ | | |
| `src/actions/items.ts` | | | ✏️ | | |
| `src/app/admin/sections/page.tsx` | | ✏️ | | | |
| `src/app/admin/usuarios/*` | | ✏️ | | | |
| `src/app/admin/grupos/*` | | ✏️ | | | |
| `src/app/admin/components/Sidebar.tsx` | | ✏️ | | | |
| `src/lib/error-handler.ts` | | | ✏️ | | |
| `src/lib/types/*` | | | ✏️ | | |
| `test/*` | | | | ✏️ | |
| `vitest.config.ts` | | | | ✏️ | |
| `docs/*` | | | | | ✏️ |
| `README.md` | | | | | ✏️ |
| `src/app/layout.tsx` | | | | | ✏️ |

✏️ = El WP modifica este archivo. **Ningún archivo es tocado por más de un WP.**
