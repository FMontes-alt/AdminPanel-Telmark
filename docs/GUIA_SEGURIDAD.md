# Guía de Seguridad: Protección de Server Actions

Esta guía detalla cómo asegurar que las nuevas funciones de backend (Server Actions) cumplan con el modelo de control de acceso basado en roles (RBAC) del proyecto.

## 1. El Helper `auth-guard.ts`

Toda la lógica de seguridad reside en `src/lib/auth-guard.ts`. Este archivo exporta funciones útiles para verificar la identidad y los permisos del usuario de forma robusta.

### Funciones Disponibles:

- `getCurrentUser()`: Obtiene el `user` de Auth y el `profile` de la base de datos.
- `requireAdmin()`: Asegura que el usuario sea `admin` o `superadmin`.
- `requireSuperAdmin()`: Asegura que el usuario sea exclusivamente `superadmin`.
- `requireRole(roles[])`: Permite especificar una lista personalizada de roles permitidos.

---

## 2. Cómo proteger una nueva Server Action

Para proteger una acción, simplemente invoca la guardia correspondiente al inicio de la función. **Importante**: Las guardias deben ser invocadas con `await`.

### Ejemplo: Acción Administrativa

```typescript
"use server"

import { requireAdmin } from "@/lib/auth-guard"
import { db } from "@/db"

export async function miAccionAdmin(data: any) {
    // 1. Verificar permisos ANTES de cualquier lógica
    await requireAdmin()
    
    // 2. Ejecutar lógica de negocio
    // ...
}
```

### Ejemplo: Acción para Múltiples Roles

```typescript
export async function miAccionCompartida() {
    // Permite tanto a usuarios normales como a administradores
    const { profile } = await requireRole(["usuario", "admin", "superadmin"])
    
    console.log(`Acción ejecutada por ${profile.firstName}`)
}
```

---

## 3. Manejo de Errores

Si un usuario no cumple con los requisitos, la guardia lanzará una excepción (`Error`). 

- **En el Cliente**: Si usas un `formAction` o invocas la función directamente, puedes capturar el error con un bloque `try/catch`.
- **Comportamiento por defecto**: El servidor detendrá la ejecución inmediatamente, evitando cualquier escritura no autorizada en la base de datos.

---

## 4. Mejores Prácticas

1. **Guardia Primero**: Invoca siempre `requireAdmin()` en la primera línea de la función.
2. **No confíes en el Middleware**: El middleware de Next.js (`proxy.ts`) protege las **rutas** (UI), pero las Server Actions son endpoints HTTP que pueden ser invocados independientemente. La validación en la acción es la última línea de defensa.
3. **Usa `getCurrentUser()` para filtrado**: Si necesitas obtener datos específicos del usuario de forma segura, usa `getCurrentUser()` en lugar de pasar el `userId` desde el cliente como argumento (lo cual es manipulable).
