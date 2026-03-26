# Resolución de Autenticación, Redirecciones y Permisos RLS

Este documento detalla los problemas de acceso, redirección y permisos de visualización encontrados, las correcciones implementadas (Opción A: Estricta) y cómo proceder opcionalmente a un entorno más abierto (Opción B: Pública).

## 1. Refactorización del Login y Redirecciones

### Estado Anterior
- **Mala ubicación de código**: La acción de servidor de Supabase `signInWithPassword` estaba en `src/app/login/actions.ts`, rompiendo la arquitectura del proyecto donde todo debía estar centralizado en `src/actions`.
- **Redirección cliente "Ciega"**: Cuando un usuario se logueaba con éxito, el archivo `src/app/login/page.tsx` ejecutaba `router.push("/admin")` sin comprobar el rol de la persona.
- **Middleware inactivo**: El archivo `src/middleware.ts` tenía comentada la línea `withAuth` responsable de bloquear el acceso a `/admin` a usuarios sin privilegios. Esto provocaba que cualquier usuario estándar redirigido al admin pudiera quedarse navegando ahí.

### Solución Implementada
- **Centralización**: Movimos la lógica a `src/actions/auth.ts`.
- **Query de Roles (RBAC)**: Mejoramos la acción de login para que, tras autenticar al usuario correctamente, consulte su tabla `profiles` para obtener su rol.
- **Redirección Condicional**: En `src/app/login/page.tsx` el cliente ahora lee la respuesta de autorización y redirige de manera lógica:
  ```typescript
  if (result.role === 'admin' || result.role === 'superadmin') {
      router.push("/admin")
  } else {
      router.push("/") // Redirección natural de usuarios al Dashboard
  }
  ```
- **Protección Server-Side**: Descomentamos `response = await withAuth(request, response)` en `middleware.ts`, fortificando la seguridad nativa del servidor contra accesos indebidos de roles no premitidos.

---

## 2. Permisos del Visor Inline (RLS en Supabase Storage)

### Estado Anterior
Los administradores podían ver los PDFs y vídeos en el Dashboard, pero los usuarios estándar obtenían un error invisible devolviendo un bloque gris vacío. Esto ocurría porque la política RLS del bucket `telmark-media` para realizar el `SELECT` fallaba al evaluar la condición:
```sql
... AND (s.slug = split_part(name, '/'::text, 1))
```

**La Causa Raíz Oculta**: En PostgreSQL, al usar `name` a secas dentro de un Subquery `EXISTS` que hacía un `JOIN sections s`, el compilador asignaba a `name` el valor de la columna `sections.name` (El nombre de la sección, con mayúsculas y espacios p. ej: "ADESLAS2") en lugar de usar la ruta del almacenamiento de `storage.objects.name` (El slug minúsculo, p. ej: "adeslas2").

Al realizar la comparación de strings, `adeslas2` = `ADESLAS2` resultaba en **FALSE** debido a la sensibilidad de mayúsculas, y bloqueaba el acceso de los usuarios a pesar de estar correctamente asignados.

### Solución Implementada (Opción A - Control Estricto)
Se modificó estrictamente el *namespace* para indicar a PostgreSQL qué dato queríamos parsear:
```sql
... AND (s.slug = split_part(storage.objects.name, '/'::text, 1))
```
Con este cambio, solo los usuarios **asignados explícitamente a una sección** en la tabla `profile_sections` en base de datos tienen el poder de desencriptar y cargar archivos privados de dicha sección.

---

## 3. ¿Cómo cambiar a la Opción B (Dashboard Público Universal)?
Si en un futuro la directiva prefiere una plataforma donde cualquier comercial o usuario pueda acceder a *cualquier* información subida al panel de control (minimizando el trabajo administrativo de asignarles secciones manualmente en bbdd), se deben modificar las políticas de Supabase Storage.

**Pasos a seguir:**
1. Iniciar sesión en el portal web de **Supabase**.
2. Navegar a la pestaña **Storage** -> **Policies** en el menú izquierdo.
3. Bajo `storage.objects`, buscar la política del entorno de producción.
4. Editar la política "Select - Assigned sections only".
5. **Reemplazar la enorme expresión SQL en el campo 'USING' por simplemente:**
   ```sql
   true
   ```
Al poner `true`, le estás diciendo a Supabase que cualquier usuario autenticado (`Target Roles: authenticated`) tiene vía libre instantánea y global para descargar y previsualizar contenido en el dashboard, anulando cualquier requerimiento de vinculación con la tabla `profile_sections`.
