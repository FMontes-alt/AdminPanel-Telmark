# Contexto del Proyecto: Plataforma de Gestión de Contenidos

Este documento sirve como registro vivo del estado del proyecto, las decisiones técnicas y la evolución de la aplicación. Se utilizará como contexto para el desarrollo y la colaboración.

## Estado Actual

- **Fase:** Configuración Inicial Guiada (Manual).
- **Tecnologías confirmadas:** React (Frontend), Next.js (Fullstack), Supabase (Base de datos/Auth), GitHub (Control de Versiones).
- **Herramientas de trabajo:** Jira (Gestión de tareas), Visual Studio Code (IDE).
- **Estructura base:** Definida en `README.md`.

## Resumen del Proyecto

Desarrollo de una plataforma web para la organización de información estructurada en tres áreas principales (ADESLAS, ENERGÍA, ALARMA) con un panel de administración para la gestión de categorías, subcategorías y contenidos (textos, documentos, archivos, enlaces).

## Decisiones Técnicas
### 2026-03-03: Selección de Base de Datos

- Se ha elegido **Supabase** como plataforma de base de datos (PostgreSQL) y autenticación.
- Supabase proporciona una base de datos relacional robusta y APIs automáticas que se integran perfectamente con Next.js.

### 2026-03-03: Herramientas de Desarrollo

- Se ha confirmado el uso de **Jira** para la gestión ágil del proyecto y seguimiento de tareas.
- El equipo utilizará **Visual Studio Code** como entorno de desarrollo principal.

### 2026-03-04: Pivote a Next.js (Confirmado)
- Tras evaluar opciones, se decide utilizar **Next.js** como framework Fullstack. Esto permite escribir el Frontend (React) y el Backend (Server Actions/API Routes) en un solo proyecto, garantizando escalabilidad y productividad.
- Se ha limpiado la instalación previa de Nest.js.

## Arquitectura (Planeada)
- **Frontend:** React.
- **Backend:** Next.js (Fullstack).
- **Base de Datos:** Supabase (PostgreSQL).
- **Navegación:** Jerárquica basada en tarjetas (Dashboard principal -> Categorías -> Subcategorías/Contenido).
- **Admin Panel:** Módulo independiente para CRUD de contenidos.

## Próximos Pasos
1. Configuración del entorno de desarrollo React.
2. Definición de la estructura de carpetas del proyecto.
3. Diseño de la interfaz de usuario (Dashboard principal).
