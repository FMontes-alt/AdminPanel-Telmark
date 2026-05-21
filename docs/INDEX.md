# 🏛️ Hub de Documentación - CMS Telmark

Bienvenido al centro de conocimiento del Panel de Administración de Telmark. Este documento sirve como punto de entrada para entender la arquitectura, guías de desarrollo y funcionalidades del sistema.

---

## 🏗️ [Arquitectura](architecture/database.md)

Conceptos base y estructura del sistema.

- 🗄️ **[Base de Datos](architecture/database.md)**: Esquema relacional, filosofía UUID y tablas core.
- 🔐 **[Seguridad y RLS](architecture/security-rls.md)**: Políticas de Row Level Security y gestión de sesiones.
- 🛡️ **[Sistema de Permisos](architecture/sistema-permisos-grupos.md)**: Herencia por Equipos, granularidad y lógica de Dashboard.
- ⚙️ **[Middleware](architecture/middleware.md)**: Roadmap y lógica de las capas de control (Auth, Security, Maintenance).
- 🏗️ **[Arquitectura Modular Quizzes](architecture/ARQUITECTURA_MODULAR_QUIZZES.md)**: Diseño y propuesta técnica.
- 📑 **[Informe de Arquitectura](architecture/INFORME_ARQUITECTURA.md)**: Informe general del estado del sistema.

## 📘 [Guías de Desarrollo](guides/setup.md)

Instrucciones paso a paso para desarrolladores.

- 🚀 **[Setup inicial](guides/setup.md)**: Instalación y configuración del entorno.
- 🛠️ **[Backend Setup](guides/backend-setup.md)**: Configuración detallada de Supabase + Drizzle.
- ⚡ **[API & Server Actions](guides/api-actions.md)**: Cómo usar y crear acciones de servidor.
- 🧬 **[Seeders & Data](guides/seeding.md)**: Poblado de datos de prueba y fábricas.
- 🔑 **[Flujo de Autenticación](guides/auth-flow.md)**: Detalles sobre el login y logout.
- 🔒 **[Guía de Seguridad](guides/GUIA_SEGURIDAD.md)**: Prácticas y manejo de RLS.
- 🔧 **[Fix Auth & RLS](guides/FIX_AUTH_RLS.md)**: Guía y soluciones para problemas comunes.
- 📁 **[Guía de Storage](guides/SUPABASE_STORAGE_GUIDE.md)**: Manejo de archivos en Supabase.

## 🚀 [Módulos y Funcionalidades](features/campaign-builder.md)

Documentación técnica de los módulos principales.

- 🎨 **[Campaign Builder](features/campaign-builder.md)**: Motor de diseño de campañas premium.
- 🔔 **[Sistema de Alertas](features/alerts-system.md)**: Trazabilidad total de eventos del sistema.
- 👥 **[Gestión de Empleados](features/gestion-empleados.md)**: Administración de accesos y redirección por sección.
- 📝 **[Sistema de Cuestionarios](features/SISTEMA_CUESTIONARIOS.md)**: Evaluaciones, formación y gestión de multimedia segura.
- 📥 **[Descargas y Enlaces](features/MEJORA_DESCARGAS_ENLACES.md)**: Optimización del sistema de distribución.
- 📺 **[Recursos Multimedia](features/MULTIMEDIA_RESOURCES.md)**: Gestión de vídeos, audios y documentos.
- 🔎 **[Visor Inline](features/VISOR_INLINE_ACTUALIZACION.md)**: Previsualización de documentos.

## 📋 [Gestión del Proyecto](project/epics.md)

Seguimiento, reglas y futuro.

- 🎯 **[Objetivos y Épicas](project/epics.md)**: Grandes bloques de trabajo y metas alcanzadas.
- 📜 **[Historial de Cambios](project/changelog.md)**: Registro de sesiones y decisiones técnicas.
- 🚀 **[Roadmap](project/roadmap.md)**: Tareas pendientes e ideas para el futuro.
- 🛠️ **[Reglas de Estilo](project/rules.md)**: Normas de desarrollo, código y UI/UX.

---
> [!TIP]
> Si eres nuevo en el proyecto, empieza por la **[Guía de Setup](guides/setup.md)**.
