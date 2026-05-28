# Guía de Deployment

Este documento detalla los pasos para desplegar el Panel de Administración de Telmark en producción (por ejemplo, en Vercel) y la configuración requerida en los servicios externos.

## Variables de Entorno Necesarias

Asegúrate de configurar las siguientes variables de entorno en la plataforma de hosting:

- `NEXT_PUBLIC_SUPABASE_URL`: La URL de tu proyecto de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave pública anónima (necesaria para el cliente de Supabase).
- `SUPABASE_SERVICE_ROLE_KEY`: La clave de administrador (Service Role Key) para bypass de RLS en acciones protegidas (NUNCA exponer en frontend).
- `DATABASE_URL`: Cadena de conexión directa a PostgreSQL (usada por Drizzle ORM).

## Configuración en Supabase

Antes de desplegar, debes configurar:

1. **Authentication**: 
   - Habilitar proveedor de Email.
   - Deshabilitar confirmación de email si se requiere crear cuentas de forma transparente.
2. **Database**:
   - Ejecutar el esquema y las migraciones usando `drizzle-kit push` o aplicar manualmente los scripts en `src/db/`.
   - Asegurarse de que las políticas RLS están activas y correctamente configuradas (ver `architecture/security-rls.md`).
3. **Storage**:
   - Crear un bucket privado llamado `telmark-media`.
   - Las descargas y acceso a los archivos se gestionarán vía URLs firmadas (Signed URLs) a través de las Server Actions.

## Despliegue en Vercel

1. Importar el repositorio desde GitHub a Vercel.
2. Asegurarse de seleccionar **Next.js** como framework predeterminado.
3. Ingresar todas las variables de entorno especificadas.
4. (Opcional) Configurar las funciones Serverless en la región más cercana a la base de datos de Supabase para minimizar la latencia.
5. Hacer clic en **Deploy**.
