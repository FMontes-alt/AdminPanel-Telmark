# Épicas del Proyecto: AdminPanel-Telmark

Este documento resume los grandes bloques de trabajo (Épicas) que definen el desarrollo de la plataforma.

## 🏗️ Epic 1: Estructura Base y CMS Genérico
- Definición de la jerarquía de 4 niveles (Secciones > Categorías > Subcategorías > Items).
- Implementación de un esquema de base de datos capaz de albergar cualquier tipo de contenido (Adeslas, Energía, etc.) sin cambios en las tablas.

## 🗄️ Epic 2: Conectividad y Drizzle
- Configuración de Supabase como backend principal.
- Implementación de Drizzle ORM para consultas tipadas y seguras.
- Sistema de Seeders y Factories para datos de prueba.

## 🔐 Epic 3: Autenticación y Seguridad
- Integración de Supabase Auth (Email/Password).
- Implementación de Middleware para protección de rutas.
- Configuración de Row Level Security (RLS) en PostgreSQL para aislar datos de usuarios.

## ⚡ Epic 4: Server Actions y CRUD
- Desarrollo de funciones de servidor para la gestión completa de contenidos.
- Implementación de validación de datos con Zod.
- Revalidación de caché de Next.js para actualizaciones en tiempo real.

## 🎨 Epic 5: Builder de Campañas Premium
- Constructor visual basado en grid dinámico.
- Sistema de widgets (Texto, Imagen, Video, Stat).
- Estética premium con Framer Motion y Tailwind.

## 🔔 Epic 6: Sistema de Alertas y Trazabilidad
- Creación de logs de eventos críticos (Borrado, Bloqueo, Errores).
- Panel de notificaciones administrativo.
- Servicio centralizado de mensajes descriptivos.

## ✨ Epic 7: Refinamiento Estético y UX
- Auditoría de diseño para asegurar coherencia visual.
- Implementación del sistema de documentación interconectado (Hub).
- Optimización de flujos de usuario y estados de carga.

---

## 🗺️ Navegación: Proyecto
- 🔙 **[Volver al Hub](../INDEX.md)**
- 🚀 **[Roadmap](roadmap.md)**
- 📜 **[Historial de Cambios](changelog.md)**

*Última actualización: 2026-03-24*
