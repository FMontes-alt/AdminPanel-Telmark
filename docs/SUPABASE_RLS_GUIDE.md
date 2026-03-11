# Documentación: Políticas RLS y Gestión de Cookies (Supabase)

Este documento recoge los problemas encontrados durante la integración con Supabase Auth y las soluciones aplicadas.

## 1. Problema: Recursión Infinita en RLS (`42P17`)

### Contexto
La tabla `profiles` tenía una política RLS llamada **"Superadmin full access"** que permitía acceso total si el usuario era superadmin. Su condición original era:

```sql
-- ❌ CAUSABA RECURSIÓN INFINITA
EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'superadmin'
)
```

### ¿Por qué fallaba?
PostgreSQL, antes de permitir un `SELECT` en `profiles`, evalúa **todas** las políticas RLS de esa tabla. Pero la propia política necesitaba un `SELECT` de `profiles` para resolverse → **bucle infinito** → error `42P17`.

### Solución Aplicada
Se creó una función `SECURITY DEFINER` que **salta las RLS** al ejecutarse (corre con permisos de "dueño" de la BBDD):

```sql
-- Paso 1: Crear función auxiliar
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'::user_role
    );
$$;

-- Paso 2: Actualizar la política para usar la función
ALTER POLICY "Superadmin full access"
ON "public"."profiles"
USING (is_superadmin());
```

> **IMPORTANTE**: Si en el futuro se crean más políticas RLS que necesiten consultar el rol del usuario desde `profiles`, deben usar `is_superadmin()` (o funciones similares con `SECURITY DEFINER`) en vez de hacer `SELECT` directo a la tabla.

## 2. Gestión de Cookies de Supabase

### ¿Qué son las cookies `sb-*`?
Cuando un usuario hace login con `signInWithPassword()`, Supabase guarda tokens JWT en cookies del navegador (prefijo `sb-`). El middleware de Next.js las lee en cada petición para saber si hay una sesión activa.

### Problema común: Sesión "fantasma"
Si el login falla por las RLS pero la cookie ya se guardó, el usuario queda en un limbo:
- Va a `/login` → middleware ve cookie → redirige a `/admin`
- Va a `/admin` → RBAC falla → redirige a `/`
- **Resultado**: Bucle de redirecciones

### Solución
Borrar manualmente las cookies `sb-*` desde las DevTools del navegador (**Application → Cookies → localhost**) para resetear la sesión y poder hacer login limpio.

## 3. Políticas RLS Actuales en `profiles`

| Nombre | Comando | Descripción |
|---|---|---|
| Superadmin full access | ALL | Usa `is_superadmin()` para dar acceso total |
| Users can view own profile | SELECT | `auth.uid() = id` (cada usuario ve solo su perfil) |
| Users can update own profile | UPDATE | `auth.uid() = id` (cada usuario edita solo su perfil) |
