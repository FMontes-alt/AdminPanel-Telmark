# Contexto del Proyecto: Plataforma de Gestión de Contenidos (AI PROMPT SOURCE)

> [!IMPORTANT]
> **INSTRUCCIONES PARA IA**: Este archivo es la fuente de verdad. Si eres una IA nueva en esta conversación, lee este bloque primero:
> 1.  **Arquitectura**: Next.js (App Router) Fullstack + Supabase.
> 2.  **Misión**: Mantener un CMS genérico de 4 niveles (Sections > Categories > Subcategories > Items).
> 3.  **Regla de Oro**: Todo contenido nuevo debe ser compatible con la estructura genérica definida. No crees tablas específicas para "Adeslas" o "Energía". Usa la jerarquía existente.

## Estado Actual
- **Fase**: Diseño Técnico Finalizado / Preparado para Integración de Datos.
- **Stack**: Next.js, React, Supabase, Tailwind CSS, Shadcn/UI.
- **Docs**: Centralizados en carpeta `docs/`.

## Arquitectura de Datos (Confirmada)
La base de datos es **relacional pura** con 4 niveles:
1.  **SECTIONS**: (Ej: ADESLAS, ENERGÍA, ALARMA).
2.  **CATEGORIES**: Agrupadores de primer nivel.
3.  **SUBCATEGORIES**: Agrupadores de segundo nivel.
4.  **ITEMS**: El "atómico" de contenido. Campos: `body` (texto), `file_path` (PDF/descargas), `external_link` (links). 

*Flexibilidad*: Usa columnas **JSONB** (`config` y `attributes`) para datos ad-hoc sin alterar el esquema.

## Decisiones Críticas
- **Seguridad**: RLS habilitado en todas las tablas de Supabase. Lectura pública inicial.
- **Identidad**: Uso estricto de **UUID** para todos los identificadores.
- **Orden**: El directorio raíz debe mantenerse limpio. Nueva lógica de negocio en `src/`, documentación en `docs/`.

## Documentación Clave
- [Diseño de Base de Datos](docs/DATABASE_DESIGN.md) (Contiene el SQL y el ERD).
- [Guía de Configuración](docs/SETUP_GUIDE.md).

## Próximos Pasos (Pendientes)
1.  Verificar ejecución del SQL en Supabase.
2.  Configurar cliente Supabase en `src/lib/supabase.ts`.
3.  Implementar Server Actions para el primer fetch de SECTIONS.
