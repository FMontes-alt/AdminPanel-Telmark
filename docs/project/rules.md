# Reglas de Desarrollo y Estilo

Este documento establece las normas obligatorias para garantizar la consistencia y calidad del código en AdminPanel-Telmark.

## 🛠️ Reglas de Oro (Arquitectura)
1. **CMS Genérico**: No crear tablas específicas para clientes (ej. "Tabla_Adeslas"). Todo debe encajar en la estructura de 4 niveles (Sections > Categories > Subcategories > Items).
2. **Server Actions First**: Priorizar el uso de Server Actions para mutaciones de datos. No mezclar lógica de base de datos directamente en los componentes.
3. **Singleton DB**: Siempre importar `db` desde `@/db` para usar la instancia única y evitar saturación de conexiones.

## 🎨 Reglas de Estilo (UI/UX)
1. **Premium Aesthetic**: Seguir el sistema de diseño basado en Shadcn/UI con toques corporativos (Blue-600, Indigo).
2. **Animaciones**: Usar Framer Motion para entradas de página y cambios de estado significativos (staggered effects).
3. **Feedback**: Toda acción destructiva (Borrar) debe tener un modal de confirmación. Toda acción exitosa debe generar un feedback visual (Alertas/Toasts).

## 📄 Reglas de Documentación (Hub System)
1. **Relative Links**: Usar siempre enlaces relativos (`../folder/file.md`) para asegurar que la documentación funcione en cualquier entorno.
2. **Navigation Footer**: Todo nuevo documento `.md` debe incluir un pie de página de tipo ` NAVEGACIÓN` que enlace de vuelta al `INDEX.md`.
3. **Mermaid**: Documentar flujos complejos o esquemas de base de datos usando bloques `mermaid` para visualización integrada.

## 🚀 Flujo de Trabajo
1. **Branching**: `feature/nombre-feature`.
2. **Commits**: Mensajes descriptivos en español (preferiblemente).
3. **Verificación**: Comprobar que el Middleware no bloquea accidentalmente nuevas rutas durante el desarrollo.

---

## 🗺️ Navegación: Proyecto
- 🔙 **[Volver al Hub](../INDEX.md)**
- 🎯 **[Objetivos y Épicas](epics.md)**
- 🚀 **[Roadmap](roadmap.md)**

*Última actualización: 2026-03-24*
