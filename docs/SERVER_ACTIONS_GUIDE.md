# Documentación: EPIC 4 - Server Actions (CRUD y Jerarquía)

Esta guía documenta las funciones del servidor creadas en la rama `feature/server-actions` para interactuar con la base de datos.

## 1. Mejora Aplicada: Singleton en `src/db/index.ts`

Se corrigió el cliente de Drizzle para usar un **patrón Singleton** mediante `globalThis`. Esto evita que en desarrollo (con Hot Reload) se abran múltiples conexiones a PostgreSQL y aparezcan errores de `too many connections`.

## 2. Estructura de Archivos

Todas las acciones están en `src/actions/`:

| Archivo | Tabla | Funciones |
|---|---|---|
| `sections.ts` | `sections` | `getSections`, `getSectionBySlug`, `getSectionById`, `createSection`, `updateSection`, `deleteSection` |
| `categories.ts` | `categories` | `getCategories(sectionId)`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory` |
| `subcategories.ts` | `subcategories` | `getSubcategories(categoryId)`, `getSubcategoryById`, `createSubcategory`, `updateSubcategory`, `deleteSubcategory` |
| `items.ts` | `items` | `getItems(subcategoryId)`, `getItemBySlug`, `getItemById`, `createItem`, `updateItem`, `deleteItem`, `setItemAttribute`, `removeItemAttribute` |
| `hierarchy.ts` | todas | `getSectionHierarchy(slug)` — devuelve el árbol completo anidado |

## 3. ¿Cómo se usan?

### Desde un Server Component (lectura)
```tsx
import { getSections } from "@/actions/sections"

export default async function MiPagina() {
    const secciones = await getSections()
    return <div>{secciones.map(s => <p key={s.id}>{s.name}</p>)}</div>
}
```

### Desde un Client Component (escritura)
```tsx
"use client"
import { createSection } from "@/actions/sections"

async function handleCreate() {
    const nueva = await createSection({
        name: "Ciberseguridad",
        slug: "ciberseguridad",
        config: { icon: "lock", color: "#FF0000" }
    })
}
```

### Atributos JSONB (items)
```tsx
import { setItemAttribute, removeItemAttribute } from "@/actions/items"

// Añadir un atributo sin borrar los existentes
await setItemAttribute(itemId, "prioridad", "alta")

// Eliminar un atributo concreto
await removeItemAttribute(itemId, "prioridad")
```

## 4. Verificación
Se comprobó el funcionamiento con una página temporal en `/test-actions` que consultó las 3 secciones y el árbol jerárquico completo de "Adeslas" (3 categorías, 8 subcategorías, 11 items). **Resultado: OK ✅**
