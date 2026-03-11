# Roadmap de Implementación: Middleware

Este documento sirve para recordar qué hemos hecho y qué falta por implementar en nuestro sistema de middleware.

## ✅ Implementado
- [x] **Gestión de Sesión:** Refresco automático de tokens de Supabase (`updateSession`).
- [x] **Control de Acceso (RBAC):** Redirección y validación de roles (`admin`, `superadmin`).
- [x] **Seguridad Avanzada:** Implementación de headers y CSP.
    - `X-Frame-Options: DENY` (Anti-Clickjacking).
    - `X-XSS-Protection: 1; mode=block` (Anti-XSS).
    - `Referrer-Policy: strict-origin-when-cross-origin`.
    - `Content-Security-Policy`: Restricción de carga de recursos.

## ⏳ En Progreso / Siguiente Paso
- [ ] **Activación de Capas:** Conectar la nueva capa de seguridad en el archivo principal `middleware.ts`.
- [ ] **Portal de Usuario:** Definir ruta y protección para el rol `usuario`.

## 🚀 Pendiente (Roadmap Futuro)
- [ ] **Maintenance Mode:** Un interruptor para cerrar el panel rápido.
- [ ] **Rate Limiting:** Controlar que no nos ataquen el login por fuerza bruta.
- [ ] **Trace ID:** Un ID único para rastrear errores en los logs.
- [ ] **Bot Blocking:** Filtrar peticiones de bots maliciosos.
