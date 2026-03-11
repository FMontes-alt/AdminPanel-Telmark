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
- [x] **Activación de Capas:** Conexión modular en `middleware.ts`.
- [x] **Maintenance Mode:** Implementado vía middleware modular y variable de entorno.
- [x] **Trace ID:** Generación de `x-trace-id` para observabilidad.

## ⏳ En Progreso / Siguiente Paso
- [ ] **Portal de Usuario:** Definir ruta y protección para el rol `usuario`.

## 🚀 Pendiente (Roadmap Futuro)
- [ ] **Rate Limiting:** Controlar ataques de fuerza bruta.
- [ ] **Bot Blocking:** Filtrar peticiones de bots maliciosos.
- [ ] **Custom Maintenance Page:** Crear la UI para `/maintenance`.
