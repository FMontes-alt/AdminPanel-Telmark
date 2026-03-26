# Contexto del Proyecto: Plataforma de Gestión de Contenidos (AI PROMPT SOURCE)

> [!IMPORTANT]
> **INSTRUCCIONES PARA IA**: Este archivo es la fuente de verdad. Si eres una IA nueva en esta conversación, lee este bloque primero:
> 1. **Arquitectura**: Next.js (App Router) Fullstack + Supabase.
> 2. **Misión**: Mantener un CMS genérico de 4 niveles (Sections > Categories > Subcategories > Items).
> 3. **Regla de Oro**: Todo contenido nuevo debe ser compatible con la estructura genérica definida. No crees tablas específicas para "Adeslas" o "Energía". Usa la jerarquía existente.

## Estado Actual

- **Fase**: Diseño Técnico Finalizado / Preparado para Integración de Datos.
- **Stack**: Next.js, React, Supabase, Tailwind CSS, Shadcn/UI.
- **Docs**: Centralizados en carpeta `docs/`.

## Arquitectura de Datos (Confirmada)
La base de datos es **relacional pura** estructurada en hierarchy + usuarios:
0.  **PROFILES**: Usuarios con roles (`superadmin`, `admin`, `usuario`). Vinculados a Supabase Auth.
0.5 **PROFILE_SECTIONS**: Tabla intermedia para asignar secciones específicas a usuarios.
1. **SECTIONS**: (Ej: ADESLAS, ENERGÍA, ALARMA).
2. **CATEGORIES**: Agrupadores de primer nivel.
3. **SUBCATEGORIES**: Agrupadores de segundo nivel.
4. **ITEMS**: Contenido atómico (texto, archivos, links).

*Flexibilidad*: Columnas **JSONB** (`config` y `attributes`) for datos dinámicos.

## Decisiones Críticas

- **Seguridad**: RLS estricto por ROLES. 
  - `superadmin`: Acceso total.
  - `admin`: Gestión de contenido global.
  - `usuario`: Solo ve las secciones asignadas en `profile_sections`.
- **Automatización**: Trigger en Supabase para crear `profile` automáticamente al registrarse en Auth.
- **Identidad**: Uso estricto de **UUID**.
- **Orden**: Directorio raíz limpio. Lógica en `src/`, docs en `docs/`.

## Documentación Clave
Toda la documentación está centralizada en el **[Hub de Documentación](docs/INDEX.md)**.

## Próximos Pasos (Pendientes)
1.  Implementar el Trigger de autocreación de perfiles en Supabase.
2.  Configurar el Middleware de Next.js para proteger rutas según el rol.
3.  Implementar Server Actions para la gestión de usuarios y asignación de secciones.
