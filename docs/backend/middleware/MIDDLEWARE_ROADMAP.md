# Roadmap de Implementación: Middleware

Este documento sirve para recordar qué hemos hecho y qué falta por implementar en nuestro sistema de middleware.

## ✅ Implementado
- [x] **Gestión de Sesión:** Refresco automático de tokens de Supabase (`updateSession`).
- [x] **Control de Acceso Básico (RBAC):** Redirección de `/admin` a `/login` si no hay sesión.
- [x] **Capa de Seguridad Inicial:** Implementación de headers de seguridad.
    - `X-Frame-Options: DENY` (Anti-Clickjacking).
    - `X-XSS-Protection: 1; mode=block` (Anti-XSS).
    - `Referrer-Policy: strict-origin-when-cross-origin`.

## ⏳ En Progreso / Siguiente Paso
- [ ] **Activación de Capas:** Conectar la nueva capa de seguridad en el archivo principal `middleware.ts`.
- [ ] **Refinamiento de RBAC:** Asegurar que los roles `admin` y `superadmin` tengan los permisos correctos en toda la app.
- [ ] **CSP (Content Security Policy):** Definir de dónde permitimos cargar scripts y estilos.

## 🚀 Pendiente (Roadmap Futuro)
- [ ] **Maintenance Mode:** Un interruptor para cerrar el panel rápido.
- [ ] **Rate Limiting:** Controlar que no nos ataquen el login por fuerza bruta.
- [ ] **Trace ID:** Un ID único para rastrear errores en los logs.
- [ ] **Bot Blocking:** Filtrar peticiones de bots maliciosos.
