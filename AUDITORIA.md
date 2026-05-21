# 🔍 AUDITORÍA TÉCNICA — AdminPanel-Telmark

**Fecha**: 21 de mayo de 2026  
**Rama auditada**: `hotfix/fix-frontend`  
**Stack**: Next.js 16 · React 19 · Supabase · Drizzle ORM · TailwindCSS 4 · Vitest

---

## 📋 Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Middleware — Estado y Análisis](#2-middleware--estado-y-análisis)
3. [RLS y Seguridad — Actuación con Supabase](#3-rls-y-seguridad--actuación-con-supabase)
4. [Testing — Estado del Proyecto](#4-testing--estado-del-proyecto)
5. [Refactorización del Código](#5-refactorización-del-código)
6. [Estructura del Proyecto](#6-estructura-del-proyecto)
7. [Documentación](#7-documentación)
8. [Resumen de Hallazgos y Prioridades](#8-resumen-de-hallazgos-y-prioridades)

---

## 1. Resumen Ejecutivo

| Área | Estado | Puntuación |
|------|--------|------------|
| Middleware | ✅ Funcional, bien segmentado | 8/10 |
| RLS + Seguridad | ⚠️ Parcial — depende de capas mixtas | 6/10 |
| Testing | 🔴 Crítico — cobertura casi nula | 2/10 |
| Refactorización Frontend | ⚠️ Necesita trabajo — exceso de `"use client"` | 5/10 |
| Refactorización Backend | ✅ Bien estructurado, deuda técnica menor | 7/10 |
| Estructura del Proyecto | ✅ Clara y modular | 8/10 |
| Documentación | ✅ Extensa y bien organizada | 8/10 |

---

## 2. Middleware — Estado y Análisis

### 2.1 Arquitectura Actual

El middleware sigue un patrón **pipeline por capas** orquestado desde `src/proxy.ts`, que actúa como punto de entrada central:

```
Petición HTTP
    │
    ├── 1. withMaintenance()  → Modo mantenimiento (redirige si está activo)
    ├── 2. createServerClient → Crea instancia Supabase para la petición
    ├── 3. updateSession()    → Refresca token de sesión
    ├── 4. withSecurity()     → Inyecta headers de seguridad (CSP, XSS, etc.)
    ├── 5. withAuth()         → Control RBAC (admin/superadmin)
    └── 6. x-trace-id         → Inyecta ID de trazabilidad
```

### 2.2 Puntos Fuertes ✅

- **Separación clara en módulos**: Cada capa vive en `src/middlewares/` con responsabilidad única (`auth.ts`, `security.ts`, `maintenance.ts`, `session.ts`).
- **Cliente Supabase singleton por request**: Se crea una única instancia en el proxy y se reutiliza en todas las capas, evitando condiciones de carrera con las cookies.
- **Headers de seguridad**: CSP configurado correctamente con `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy` y Content-Security-Policy robusto.
- **Trazabilidad**: Cada petición obtiene un `x-trace-id` UUID, útil para debugging en producción.

### 2.3 Problemas y Riesgos ⚠️

| # | Problema | Severidad | Archivo |
|---|----------|-----------|---------|
| M1 | **Tipado `any` en Supabase del proxy** — El parámetro `supabase` en `withAuth()` y `updateSession()` está tipado como `any`, perdiendo seguridad de tipos. | Media | `proxy.ts`, `auth.ts`, `session.ts` |
| M2 | **Doble consulta a `profiles` en auth** — Cuando un usuario autenticado accede a `/login` y luego a `/admin`, se hacen 2 queries a `profiles.role` en la misma petición (líneas 19 y 41 de `auth.ts`). | Baja | `auth.ts` |
| M3 | **Modo mantenimiento sin página** — `withMaintenance()` redirige a `/maintenance` pero tiene un TODO indicando que esa página no existe aún. | Media | `maintenance.ts` L14 |
| M4 | **`@ts-ignore` en proxy** — Se ignora un error de tipos en `autoRefreshToken` (L46-47 del proxy). Puede ocultar incompatibilidades futuras al actualizar `@supabase/ssr`. | Baja | `proxy.ts` L46 |
| M5 | **Dashboard (`/dashboard`) sin protección middleware** — Las rutas `/dashboard/*` son verificadas en `withAuth` pero solo comprueban si `isAdminRoute` o `isLoginRoute`, no fuerzan autenticación para `/dashboard`. Un usuario no autenticado que accede a `/dashboard` no es redirigido por el middleware; la protección existe solo a nivel de Server Action (`getCurrentUser`). | Alta | `auth.ts` L13 |

### 2.4 Recomendaciones

1. **Tipar el cliente Supabase**: Crear una interfaz `SupabaseMiddlewareClient` en lugar de usar `any`.
2. **Cachear la query de perfil**: Reutilizar el resultado de `profiles.role` para evitar doble consulta.
3. **Crear la página de mantenimiento** (`/maintenance`).
4. **Proteger `/dashboard` en middleware**: Añadir `if (isDashboardRoute && !user)` → redirect a `/login`.

---

## 3. RLS y Seguridad — Actuación con Supabase

### 3.1 Modelo de Seguridad Multi-Capa

El proyecto implementa seguridad en **3 capas**:

```
┌─────────────────────────────────────────────────┐
│  Capa 1: MIDDLEWARE (Next.js)                   │
│  → RBAC a nivel de ruta (/admin, /dashboard)    │
├─────────────────────────────────────────────────┤
│  Capa 2: SERVER ACTIONS (auth-guard.ts)         │
│  → requireAdmin() / requireSuperAdmin()         │
│  → Verificación de rol antes de cada mutación   │
├─────────────────────────────────────────────────┤
│  Capa 3: SUPABASE RLS (PostgreSQL)              │
│  → Políticas a nivel de tabla/bucket            │
│  → Control granular de lectura en Storage       │
└─────────────────────────────────────────────────┘
```

### 3.2 Auth Guard — Análisis de Cobertura

El archivo `src/lib/auth-guard.ts` proporciona 3 funciones:
- `getCurrentUser()`: Obtiene sesión + perfil.
- `requireRole(roles)`: Lanza excepción si no tiene rol.
- `requireAdmin()`: Atajo para `["admin", "superadmin"]`.

**Cobertura por Server Action:**

| Archivo de Actions | Operaciones de Lectura | Operaciones de Escritura | ¿Protegidas? |
|---|---|---|---|
| `sections.ts` | `getAllSections`, `getSectionBySlug`, `getSectionById` | `createSection`, `updateSection`, `deleteSection` | ⚠️ Lecturas **NO protegidas**, escrituras ✅ |
| `categories.ts` | Lecturas implícitas | `create`, `update`, `delete`, `reorder` | ⚠️ Lecturas **NO protegidas**, escrituras ✅ |
| `subcategories.ts` | `getSubcategories`, `getSubcategoryById` | `create`, `update`, `delete` | ⚠️ Lecturas **NO protegidas**, escrituras ✅ |
| `items.ts` | `getItems`, `getItemBySlug`, `getItemById` | `createItem`, `updateItem`, `deleteItem`, `setItemAttribute`, `removeItemAttribute` | ⚠️ Lecturas **NO protegidas**, escrituras ✅ |
| `users.ts` | `getAgents`, `getAgentById`, `getDashboardData` | `createAgent`, `updateAgent`, `deleteAgent` | ⚠️ `getAgents` y `getAgentById` **NO protegidas**, escrituras ✅ |
| `quizzes.ts` | `getQuizzes`, `getQuizById`, `getQuizBySlug`, `getPublishedQuizzes`, `getQuizQuestionCount` | `createQuiz`, `updateQuiz`, `publishQuiz`, `deleteQuiz` | 🔴 **SIN protección en ninguna operación** — ni lectura ni escritura tienen `requireAdmin()` |
| `quiz-attempts.ts` | `getAttemptResults`, `getUserAttempts`, `getQuizAttempts`, `getPendingReviews` | `startAttempt`, `completeAttempt`, `submitAnswer`, `gradeShortAnswer` | 🔴 **SIN protección** — ninguna función verifica sesión del usuario |
| `quiz-questions.ts` | `getQuestions`, `getQuestionById` | `createQuestion`, `updateQuestion`, `reorderQuestions`, `deleteQuestion` | ⚠️ Debe verificarse |
| `quiz-stats.ts` | `getQuizAnalytics` | N/A | ⚠️ Debe verificarse |
| `groups.ts` | `getGroups`, `getGroupById` | `upsertGroup`, `deleteGroup` | ⚠️ Lecturas **NO protegidas**, escrituras ✅ |
| `permissions.ts` | `getHierarchy`, `getUserPermissions` | `updateUserPermissions` | ✅ Todas protegidas |
| `storage.ts` | `getPublicUrl`, `getSignedUrl`, `getDownloadUrl` | `uploadFile`, `deleteFile`, `deleteMultiple`, `deleteDirectory` | ⚠️ Lecturas de URL **NO protegidas** (permitido para dashboard), escrituras ✅ |
| `alerts.ts` | `getAlerts`, etc. | `markAsRead`, etc. | ✅ Todas protegidas |
| `auth.ts` | N/A | `login`, `logout` | ✅ N/A (Funciones de autenticación) |

### 3.3 RLS en Supabase Storage

Según la documentación `docs/FIX_AUTH_RLS.md`:

- **Bug resuelto**: El RLS del bucket `telmark-media` usaba `name` ambiguo (resuelto cualificando con `storage.objects.name`).
- **Política actual**: Solo usuarios asignados a una sección ven los archivos de esa sección.
- **Opción B documentada**: Posibilidad de cambiar a `true` en el RLS para acceso global.

### 3.4 Vulnerabilidades Detectadas 🔴

| # | Vulnerabilidad | Impacto | Acción Requerida |
|---|---------------|---------|------------------|
| S1 | **Quizzes sin protección** — `createQuiz`, `updateQuiz`, `deleteQuiz` no llaman a `requireAdmin()`. Un usuario autenticado podría crear/modificar/borrar cuestionarios. | **CRÍTICO** | Añadir `requireAdmin()` a operaciones de escritura. |
| S2 | **Quiz Attempts sin verificación de usuario** — `startAttempt` recibe `userId` como parámetro sin validar que coincida con el usuario autenticado. Un atacante podría iniciar intentos en nombre de otro usuario. | **CRÍTICO** | Obtener `userId` de la sesión, no del parámetro. |
| S3 | **`gradeShortAnswer` sin protección** — Cualquier usuario autenticado podría calificar respuestas de otros. | **ALTO** | Añadir `requireAdmin()`. |
| S4 | **Lecturas de usuarios expuestas** — `getAgents()` devuelve todos los perfiles (incluyendo emails, teléfonos) sin requerir autenticación de admin. | **MEDIO** | Añadir `requireAdmin()`. |
| S5 | **`getSignedUrlAction` y `getDownloadUrlAction` sin verificar permisos** — Cualquier usuario autenticado podría generar URLs firmadas de archivos que no le corresponden si conoce el path. | **MEDIO** | Verificar que el usuario tiene acceso a la sección. |

### 3.5 Conexiones a la Base de Datos

El proyecto usa **dos caminos de acceso** a datos:
1. **Drizzle ORM** (`src/db/index.ts`): Conexión directa PostgreSQL via `postgres` driver. **NO pasa por RLS** (usa `DATABASE_URL` que probablemente es la connection string directa).
2. **Supabase Client** (`@supabase/ssr`): Para auth y storage. **SÍ respeta RLS**.

> [!CAUTION]
> Las queries Drizzle ORM bypasean completamente las políticas RLS de Supabase. Toda la seguridad de datos depende del `auth-guard.ts` a nivel de Server Actions. Si una Server Action no llama a `requireAdmin()`, la query se ejecuta sin restricciones.

---

## 4. Testing — Estado del Proyecto

### 4.1 Infraestructura

- **Framework**: Vitest 4.0 con jsdom
- **Config**: `vitest.config.ts` configurado con alias `@` y plugin React
- **Testing Library**: `@testing-library/react` y `@testing-library/dom` instalados como devDependencies

### 4.2 Tests Existentes

| Archivo | Tipo | Descripción | Estado |
|---------|------|-------------|--------|
| `test/basic.test.ts` | Unitario | Smoke test: `1 + 1 === 2` | ✅ Pasa |
| `test/middleware.test.ts` | Integración | 2 tests del middleware (redirect anónimo + paso a home) | ⚠️ Mock desactualizado — referencia `@/middleware` pero el middleware se movió a `src/proxy.ts` |
| `test/test_alert.ts` | Manual | Script para probar alertas contra BD real | ⚠️ No es un test real (sin assertions) |
| `test/manual/test-actions.tsx` | Manual | Componente React para probar server actions | ⚠️ No es un test automatizado |
| `test/manual/test-db-drizzle.tsx` | Manual | Componente para probar Drizzle | ⚠️ No es un test automatizado |
| `test/manual/test-db-supabase.tsx` | Manual | Componente para probar Supabase | ⚠️ No es un test automatizado |

### 4.3 Cobertura de Tests

```
┌────────────────────────────────────┬──────────────┐
│ Área                               │ Tests        │
├────────────────────────────────────┼──────────────┤
│ Server Actions (16 archivos)       │ 0 tests      │
│ Middleware (4 capas)               │ 2 tests (*)  │
│ Componentes UI (50+ componentes)   │ 0 tests      │
│ Utilidades (auth-guard, storage)   │ 0 tests      │
│ Schema/Factories                   │ 0 tests      │
├────────────────────────────────────┼──────────────┤
│ TOTAL                              │ ~3 tests     │
│ Cobertura estimada                 │ < 1%         │
└────────────────────────────────────┴──────────────┘
(*) Los tests del middleware probablemente fallan por
    referencia desactualizada a @/middleware
```

### 4.4 Recomendaciones Prioritarias para Testing

1. **Tests de Server Actions** (Prioridad ALTA):
   - Testear que `requireAdmin()` bloquea usuarios no autorizados.
   - Testear CRUD de secciones, categorías, items.
   - Testear flujo de quiz (start → submit → complete → grade).

2. **Tests de Middleware** (Prioridad MEDIA):
   - Corregir import (apuntar a `src/proxy.ts`).
   - Añadir test de usuario admin en `/admin` (debe pasar).
   - Añadir test de usuario normal en `/admin` (debe redirigir).
   - Testear headers de seguridad (CSP, XSS, etc.).

3. **Tests de Componentes** (Prioridad BAJA):
   - Testear formularios críticos (login, creación de usuarios).
   - Testear modales de confirmación.

---

## 5. Refactorización del Código

### 5.1 Frontend — Problemas Detectados

#### 5.1.1 Exceso de `"use client"` 🔴

Se encontraron **50+ componentes** marcados como `"use client"`. Esto tiene consecuencias:
- **Bundles más grandes**: Todo el código se envía al cliente.
- **No se aprovechan los Server Components de React 19/Next 16**.
- **SEO impactado**: El contenido no se pre-renderiza en servidor.

**Archivos que deberían ser Server Components:**
- `src/app/admin/sections/page.tsx` → La página podría fetchear datos en servidor y pasar a un componente cliente hijo.
- `src/app/admin/quizzes/page.tsx` → Misma oportunidad.
- `src/app/admin/usuarios/page.tsx` → Los datos de la lista podrían cargarse en servidor.
- `src/app/dashboard/page.tsx` → Contenido estático que podría ser SSR.

#### 5.1.2 Componentes Monolíticos

| Componente | Líneas | Problema |
|-----------|--------|----------|
| `Sidebar.tsx` | 12,366 bytes | Componente masivo que maneja navegación, estado, animaciones. Debería dividirse. |
| `AgentForm.tsx` | 19,798 bytes | Formulario enorme con lógica de grupos + permisos. Debería descomponerse. |
| `quizzes/page.tsx` (admin) | 19,812 bytes | Página con lógica de listado, filtros, acciones inline. |
| `sections/page.tsx` (admin) | 13,811 bytes | Similar al anterior. |
| `dashboard/page.tsx` | 15,420 bytes | Lógica de dashboard compleja en un solo archivo. |

#### 5.1.3 Convenciones de Nombrado Inconsistentes

- **Mezcla de estilos**: Algunos componentes usan PascalCase para archivos (`AgentForm.tsx`) y otros kebab-case (`admin-page-header.tsx`).
- **Typo en archivos**: `campaing-builder.ts` → debería ser `campaign-builder.ts`.
- **Rutas en español e inglés mezcladas**: `/admin/usuarios`, `/admin/grupos` (ES) vs `/admin/sections`, `/admin/campaigns`, `/admin/quizzes` (EN).

#### 5.1.4 Componentes UI Duplicados

- `src/components/ui/AlertModal.tsx` y `src/app/admin/sections/[slug]/components/AlertModal.tsx` — Dos modales de alerta con funcionalidad similar.
- `src/components/ui/DeleteConfirmModal.tsx` y `src/app/admin/sections/[slug]/components/DeleteModal.tsx` — Dos modales de confirmación de borrado.

### 5.2 Backend — Problemas Detectados

#### 5.2.1 Uso Excesivo de `as any`

Se encontraron **10 instancias** de `as any` en las Server Actions:

| Archivo | Línea | Contexto |
|---------|-------|----------|
| `users.ts` | 92, 177 | `sectionWithImage = s as any` |
| `sections.ts` | 64, 117, 118 | `config as any`, `oldConfig as any` |
| `quiz-attempts.ts` | 72 | `status: finalStatus as any` |
| `groups.ts` | 22 | Query cast para filtro `ilike` |
| `bulk-actions.ts` | 52, 69, 103 | Arrays y error cast |

#### 5.2.2 Retornos Inconsistentes

Las Server Actions no tienen un contrato de retorno uniforme:

```typescript
// Patrón A: { success, data } o { error }
return { success: true, data: newQuiz }
return { error: formatted.message }

// Patrón B: { success, error }
return { success: true }
return { success: false, error: error.message }

// Patrón C: Retorno directo
return result  // Array sin envolver
return null    // Sin formato
```

#### 5.2.3 Error Handling Inconsistente

- Algunos actions usan `formatError()` (quizzes, quiz-attempts).
- Otros hacen `catch (error: any)` y acceden a `error.message` directamente (users, groups).
- Otros no hacen catch en absoluto (sections/create llama a `requireAdmin()` que lanza excepciones no capturadas).

#### 5.2.4 `console` Statements en Producción

Se encontraron **85+ instancias** de `console.log`, `console.error` y `console.warn` en el código fuente:
- `~45` en scripts de DB (seed, migrations) → **Aceptable**.
- `~35` en Server Actions → **Debería usar un logger estructurado**.
- `~5` en middleware/proxy → **Aceptable para debugging, pero debería ser configurable**.

#### 5.2.5 TODOs Pendientes

| Archivo | TODO | Estado |
|---------|------|--------|
| `middlewares/maintenance.ts` | Crear página de mantenimiento | ❌ Pendiente |
| `lib/types/campaing-builder.ts` | Traer archivos de BD Supabase | ❌ Pendiente |
| `lib/types/campaing-builder.ts` | Añadir más componentes (PDF, enlace, stats) | ❌ Pendiente |
| `campaigns/builder/CampaignsBuilder.tsx` | Lógica de guardado | ❌ Pendiente |
| `campaigns/builder/CampaignsBuilder.tsx` | Integración con Supabase | ❌ Pendiente |

#### 5.2.6 Campo Legado `assignedSectionIds`

En `profiles` existe un campo `assignedSectionIds` (array de UUIDs) que ha sido reemplazado por el sistema de permisos/grupos pero sigue en el schema y se referencia en `getDashboardData()` por compatibilidad. Debería migrarse y eliminarse.

### 5.3 Resumen de Refactorización

| Categoría | Acción | Prioridad |
|-----------|--------|-----------|
| Seguridad | Proteger Server Actions de quizzes/attempts | 🔴 Crítica |
| Frontend | Migrar pages de `"use client"` a Server Components | 🟡 Alta |
| Frontend | Dividir componentes monolíticos (Sidebar, AgentForm) | 🟡 Alta |
| Frontend | Unificar modales duplicados | 🟢 Media |
| Backend | Estandarizar retornos de Server Actions | 🟡 Alta |
| Backend | Reemplazar `as any` por tipos correctos | 🟢 Media |
| Backend | Implementar logger estructurado | 🟢 Media |
| Backend | Unificar error handling con `formatError()` | 🟢 Media |
| Backend | Eliminar campo legado `assignedSectionIds` | 🟢 Baja |

---

## 6. Estructura del Proyecto

### 6.1 Árbol de Directorios

```
AdminPanel-Telmark/
├── docs/                          # 📚 Documentación del proyecto
│   ├── INDEX.md                   #    Hub central de documentación
│   ├── architecture/              #    Arquitectura técnica
│   │   ├── database.md
│   │   ├── middleware.md
│   │   ├── security-rls.md
│   │   └── sistema-permisos-grupos.md
│   ├── features/                  #    Docs de funcionalidades
│   │   ├── alerts-system.md
│   │   ├── campaign-builder.md
│   │   └── gestion-empleados.md
│   ├── guides/                    #    Guías de desarrollo
│   │   ├── setup.md
│   │   ├── backend-setup.md
│   │   ├── api-actions.md
│   │   ├── seeding.md
│   │   └── auth-flow.md
│   └── project/                   #    Gestión de proyecto
│       ├── changelog.md
│       ├── epics.md
│       ├── roadmap.md
│       └── rules.md
├── drizzle/                       # 🗄️ Migraciones SQL
│   ├── 0000_normal_madame_hydra.sql
│   ├── 0001_foamy_madame_hydra.sql
│   ├── 0001_parched_gertrude_yorkes.sql
│   └── 0002_conscious_longshot.sql
├── src/
│   ├── actions/                   # ⚡ Server Actions (16 archivos)
│   │   ├── auth.ts                #    Login / Logout
│   │   ├── sections.ts            #    CRUD Secciones
│   │   ├── categories.ts          #    CRUD Categorías
│   │   ├── subcategories.ts       #    CRUD Subcategorías
│   │   ├── items.ts               #    CRUD Items + JSONB helpers
│   │   ├── users.ts               #    Gestión de empleados
│   │   ├── groups.ts              #    Gestión de equipos
│   │   ├── permissions.ts         #    Sistema de permisos
│   │   ├── quizzes.ts             #    CRUD Cuestionarios
│   │   ├── quiz-questions.ts      #    CRUD Preguntas
│   │   ├── quiz-attempts.ts       #    Intentos y respuestas
│   │   ├── quiz-stats.ts          #    Analíticas de quizzes
│   │   ├── storage.ts             #    Supabase Storage
│   │   ├── alerts.ts              #    Sistema de alertas
│   │   ├── hierarchy.ts           #    Datos jerárquicos
│   │   └── bulk-actions.ts        #    Operaciones masivas
│   ├── app/                       # 📱 Rutas de la aplicación
│   │   ├── layout.tsx             #    Root layout
│   │   ├── page.tsx               #    Home (redirección inteligente)
│   │   ├── globals.css            #    Estilos globales
│   │   ├── login/                 #    Página de login
│   │   ├── admin/                 #    Panel de administración
│   │   │   ├── layout.tsx         #    Layout con Sidebar + Header
│   │   │   ├── page.tsx           #    Dashboard admin
│   │   │   ├── sections/          #    Gestión de secciones
│   │   │   ├── campaigns/         #    Builder de campañas
│   │   │   ├── quizzes/           #    Gestión de cuestionarios
│   │   │   ├── usuarios/          #    Gestión de empleados
│   │   │   ├── grupos/            #    Gestión de equipos
│   │   │   ├── alerts/            #    Panel de alertas
│   │   │   ├── monitoring/        #    Monitorización
│   │   │   └── profile/           #    Perfil del admin
│   │   ├── dashboard/             #    Dashboard de empleados
│   │   ├── manual/                #    Manual de uso
│   │   └── soporte/               #    Página de soporte
│   ├── components/                # 🧩 Componentes reutilizables
│   │   ├── ui/                    #    Componentes base (Shadcn)
│   │   ├── auth/                  #    Componentes de auth
│   │   └── dashboard/             #    Componentes del dashboard
│   ├── db/                        # 🗄️ Capa de base de datos
│   │   ├── schema.ts              #    Definición de tablas (Drizzle)
│   │   ├── index.ts               #    Conexión singleton
│   │   ├── factories.ts           #    Factories para seed
│   │   ├── seed.ts                #    Script de poblado
│   │   └── migrate*.ts            #    Scripts de migración
│   ├── lib/                       # 🔧 Utilidades compartidas
│   │   ├── auth-guard.ts          #    Protección de Server Actions
│   │   ├── error-handler.ts       #    Formateo de errores
│   │   ├── storage-utils.ts       #    Helpers de storage
│   │   ├── utils.ts               #    Utilidades generales
│   │   ├── supabase/              #    Clientes Supabase
│   │   │   ├── server.ts          #    Cliente servidor
│   │   │   ├── client.ts          #    Cliente navegador
│   │   │   └── admin.ts           #    Cliente admin (service_role)
│   │   ├── types/                 #    Tipos TypeScript
│   │   │   ├── quiz.ts
│   │   │   └── campaing-builder.ts
│   │   └── constants/             #    Constantes
│   ├── middlewares/               # 🛡️ Capas del middleware
│   │   ├── auth.ts
│   │   ├── security.ts
│   │   ├── maintenance.ts
│   │   └── session.ts
│   ├── services/                  # 📦 Servicios de negocio
│   │   └── alerts/                #    Servicio de alertas
│   └── proxy.ts                   # 🔄 Orquestador del middleware
├── test/                          # 🧪 Tests
│   ├── basic.test.ts
│   ├── middleware.test.ts
│   ├── test_alert.ts
│   └── manual/                    #    Tests manuales
└── Configs: package.json, tsconfig.json, drizzle.config.ts,
    vitest.config.ts, eslint.config.mjs, postcss.config.mjs
```

### 6.2 Valoración de la Estructura

| Aspecto | Evaluación |
|---------|-----------|
| Separación de responsabilidades | ✅ **Excelente** — Actions, DB, Middleware, Components bien separados |
| Convenciones de archivos | ⚠️ **Mejorable** — Mezcla de idiomas (ES/EN) en rutas |
| Ubicación de Server Actions | ✅ **Correcto** — Centralizado en `src/actions/` |
| Componentes UI base | ✅ **Correcto** — Shadcn en `src/components/ui/` |
| Tipado | ⚠️ **Parcial** — Tipos en `lib/types/` pero muchos `any` |
| Archivos sueltos en raíz | ⚠️ **Mejorable** — `diario_practicas.html`, `historial_git.csv`, `jira_tasks.csv`, `lint_output.txt` deberían moverse a `docs/project/` o `.gitignore` |

### 6.3 Schema de Base de Datos

12 tablas definidas en `src/db/schema.ts`:

```
profiles ─────────────┐
                      │
sections ────┬────────┤
    │        │        │
categories ──┤   groups ─── user_groups
    │        │        │
subcategories│   permissions
    │        │
items        │
             │
quizzes ─────┤
    │        │
quiz_questions  alerts
    │
quiz_options
    │
quiz_attempts
    │
quiz_answers
```

> El schema está **bien diseñado** con relaciones claras, cascade deletes, y uso de UUIDs consistente. Los enums tipados (roles, tipos de pregunta, tipos de alerta) aportan integridad.

---

## 7. Documentación

### 7.1 Estado Actual

La documentación vive en `docs/` con un `INDEX.md` como hub central organizado en 4 secciones:

| Sección | Archivos | Estado |
|---------|----------|--------|
| **Arquitectura** | `database.md`, `middleware.md`, `security-rls.md`, `sistema-permisos-grupos.md` | ✅ Completa |
| **Guías de Desarrollo** | `setup.md`, `backend-setup.md`, `api-actions.md`, `seeding.md`, `auth-flow.md` | ✅ Completa |
| **Funcionalidades** | `campaign-builder.md`, `alerts-system.md`, `gestion-empleados.md` | ✅ Completa |
| **Gestión de Proyecto** | `epics.md`, `changelog.md`, `roadmap.md`, `rules.md` | ✅ Completa |

### 7.2 Documentación Adicional (raíz de `docs/`)

| Archivo | Contenido | Actualizado |
|---------|-----------|------------|
| `FIX_AUTH_RLS.md` | Resolución del bug de RLS en Storage | ✅ |
| `GUIA_SEGURIDAD.md` | Guía de seguridad general | ✅ |
| `SISTEMA_CUESTIONARIOS.md` | Documentación del sistema de quizzes | ✅ |
| `SUPABASE_STORAGE_GUIDE.md` | Guía de uso de Supabase Storage | ✅ |
| `MULTIMEDIA_RESOURCES.md` | Gestión de recursos multimedia | ✅ |
| `VISOR_INLINE_ACTUALIZACION.md` | Actualización del visor inline | ✅ |
| `MEJORA_DESCARGAS_ENLACES.md` | Mejora de descargas y enlaces | ✅ |
| `ARQUITECTURA_MODULAR_QUIZZES.md` | Arquitectura modular de quizzes | ✅ |
| `INFORME_ARQUITECTURA.md` | Informe general de arquitectura (30KB) | ✅ |

### 7.3 Puntos Fuertes de la Documentación ✅

- **Hub centralizado** con INDEX.md bien organizado con emojis y enlaces internos.
- **Nivel de detalle alto** — Los docs incluyen diagramas, ejemplos SQL, decisiones de diseño.
- **Documentación de bugs resueltos** — `FIX_AUTH_RLS.md` documenta la causa raíz, solución y alternativas.
- **Changelog detallado** con sesiones de trabajo registradas.

### 7.4 Áreas de Mejora ⚠️

| # | Problema | Recomendación |
|---|----------|---------------|
| D1 | **Docs sueltos vs organizados** — Hay 10 `.md` sueltos en la raíz de `docs/` además de los organizados en carpetas. | Mover a subcarpetas (`docs/fixes/`, `docs/updates/`). |
| D2 | **Sin documentación de API** — No existe una referencia de todas las Server Actions con sus parámetros y retornos. | Crear `docs/guides/api-reference.md`. |
| D3 | **Sin documentación de testing** — No hay guía de cómo ejecutar o escribir tests. | Crear `docs/guides/testing.md`. |
| D4 | **README.md mínimo** — El README de 739 bytes es demasiado básico para el tamaño del proyecto. | Expandir con quick start, arquitectura resumida, y enlace a docs. |
| D5 | **Sin documentación de deployment** — No hay guía de despliegue (Vercel, variables de entorno necesarias, etc.). | Crear `docs/guides/deployment.md`. |
| D6 | **Diagrama de BD como imagen** — `database_schema.png` no se puede actualizar automáticamente. | Considerar Mermaid para diagramas actualizables. |
| D7 | **`lang="en"` en root layout** — El proyecto está en español pero el HTML declara `lang="en"`. | Cambiar a `lang="es"`. |

---

## 8. Resumen de Hallazgos y Prioridades

### 🔴 Prioridad CRÍTICA (resolver inmediatamente)

| # | Hallazgo | Área |
|---|----------|------|
| 1 | **Server Actions de quizzes sin `requireAdmin()`** — Cualquier usuario puede crear/editar/borrar cuestionarios. | Seguridad |
| 2 | **`startAttempt` acepta `userId` sin validar** — Suplantación de identidad posible. | Seguridad |
| 3 | **`gradeShortAnswer` sin autorización** — Cualquier usuario podría calificar respuestas. | Seguridad |
| 4 | **Cobertura de tests < 1%** — No hay forma de verificar regresiones. | Testing |

### 🟡 Prioridad ALTA (resolver en el próximo sprint)

| # | Hallazgo | Área |
|---|----------|------|
| 5 | `/dashboard` no protegido en middleware | Seguridad |
| 6 | `getAgents()` expone datos sin auth | Seguridad |
| 7 | Exceso de `"use client"` en páginas que podrían ser Server Components | Frontend |
| 8 | Retornos inconsistentes en Server Actions | Backend |
| 9 | Componentes monolíticos (Sidebar 12KB, AgentForm 20KB) | Frontend |

### 🟢 Prioridad MEDIA (planificar)

| # | Hallazgo | Área |
|---|----------|------|
| 10 | Reemplazar `as any` por tipos correctos | Backend |
| 11 | Unificar modales duplicados (AlertModal, DeleteModal) | Frontend |
| 12 | Crear página de mantenimiento | Middleware |
| 13 | Logger estructurado en lugar de `console.*` | Backend |
| 14 | Consistencia de idioma en rutas (todo EN o todo ES) | Estructura |
| 15 | Expandir documentación (API reference, testing guide, deployment) | Docs |
| 16 | Eliminar campo legado `assignedSectionIds` | DB |
| 17 | Limpiar archivos sueltos de raíz (`diario_practicas.html`, CSVs) | Estructura |
| 18 | Fix `lang="en"` → `lang="es"` en root layout | Frontend |

---

> **Conclusión**: El proyecto tiene una **arquitectura bien diseñada** con buena separación de responsabilidades y documentación extensa. Los problemas más graves se concentran en la **falta de protección de las Server Actions de quizzes** y la **cobertura de tests prácticamente inexistente**. El frontend necesita refactorización para aprovechar mejor Server Components de Next.js 16 y reducir el bundle del cliente.
