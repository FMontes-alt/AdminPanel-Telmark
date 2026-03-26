# Roadmap: Próximos Pasos y Pendientes

Este documento lista las tareas prioritarias y la visión a futuro del panel administrativo.

## 🛡️ Seguridad y Robustez
- [ ] **Reactivar RBAC**: Habilitar la restricción por roles (`admin`/`superadmin`) en `middleware.ts`.
- [ ] **Refresh Tokens**: Optimizar la gestión de sesión en el cliente para evitar expiraciones inesperadas.
- [ ] **Audit Log Detallado**: Guardar quién (ID de usuario) realizó qué acción en la tabla de alertas.

## 📦 Funcionalidades CMS
- [ ] **Portal de Usuario**: Desarrollar la interfaz simplificada para el rol `usuario` (solo lectura de secciones asignadas).
- [ ] **File Storage**: Integrar Supabase Storage o AWS S3 para la subida real de PDFs e Imágenes (actualmente se usa `file_path` como texto).
- [ ] **Buscador Global**: Implementar búsqueda de Items en todo el CMS desde el panel admin.

## 🎨 Mejoras de UI/UX
- [ ] **Dashboard de Inicio**: Crear widgets de resumen en la home de `/admin` (últimos items creados, alertas críticas).
- [ ] **Drag & Drop de Categorías**: Permitir reordenar la jerarquía visualmente.
- [ ] **Modo Oscuro**: Implementar soporte nativo para `Dark Mode`.

## ⚙️ Mantenimiento
- [ ] **Diagrama ERD**: Regenerar el archivo `database_schema.png` con la estructura final.
- [ ] **Tests E2E**: Añadir pruebas con Playwright para el flujo de login y creación de secciones.

---

## 🗺️ Navegación: Proyecto
- 🔙 **[Volver al Hub](../INDEX.md)**
- 🎯 **[Objetivos y Épicas](epics.md)**
- 📜 **[Historial de Cambios](changelog.md)**

*Última actualización: 2026-03-24*