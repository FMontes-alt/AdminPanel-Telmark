# Documentación: Sistema de Gestión Multimedia (EPIC 6)

Este documento resume la implementación del sistema de archivos y multimedia para el panel de administración e intranet de Telmark.

## 🚀 Resumen del EPIC 6
Se ha implementado una solución robusta para la gestión de contenidos informativos, documentos y videos, integrando **Supabase Storage** con una capa de seguridad privada.

### Características Principales
- **Subida de Archivos**: Soporte para arrastrar y soltar (Drag & Drop) en el panel de administración.
- **Seguridad Privada**: Los archivos no son públicos. Se accede a ellos mediante **Signed URLs** temporales generadas al hacer clic.
- **Soporte de Video Triple**:
    - **Local**: Subida de archivos .mp4, .mov, etc.
    - **Link**: Enlaces directos a videos externos.
    - **Embed**: Soporte para códigos `<iframe>` de YouTube/Vimeo.
- **Sanitización Automática**: Los nombres de archivos se limpian de caracteres especiales y se les añade un timestamp para evitar duplicados.
- **Límite Ampliado**: Soporte para archivos de hasta **50MB**.

## 🏗️ Arquitectura Técnica

### 1. Almacenamiento (Supabase Storage)
- **Bucket**: `telmark-media` (Privado).
- **Ruta Estructurada**: Los archivos se guardan siguiendo la estructura `seccion/categoria/archivo.ext`. Esto permite aplicar reglas de acceso granulares.

### 2. Base de Datos (Drizzle ORM)
- Se ha actualizado la tabla `items` para incluir:
    - `contentType`: Enum (`info`, `document`, `file`, `link`, `video`).
    - `filePath`: Ruta lógica en el bucket.
    - `externalLink`: URL externa o código iframe.
    - `attributes`: JSON dinámico para configuraciones extra (ej. origen del video).

### 3. Seguridad (RLS)
Se han aplicado políticas de nivel de fila (RLS) en `storage.objects`:
- **Admins**: Acceso total (Lectura/Escritura).
- **Usuarios**: Solo pueden leer archivos si pertenecen a una sección que tengan asignada en su perfil (`profile_sections`).

## 🛠️ Componentes Clave

1.  **`src/actions/storage.ts`**: Server Actions para `uploadFile`, `deleteFile` y `getSignedUrl`.
2.  **`src/lib/storage-utils.ts`**: Utilidades para limpiar nombres de archivos y construir rutas.
3.  **`ItemForm.tsx`**: Formulario dinámico con zona de Dropzone.
4.  **`ContentItem.tsx`**: Lógica de clic para abrir archivos privados o enlaces externos.
5.  **`next.config.ts`**: Configuración de `bodySizeLimit: "50mb"`.

## 📖 Cómo usar el sistema
1.  **Desde Admin**: Al crear un ítem, elige el tipo (ej. Video). Selecciona el origen y sube el archivo o pega el código.
2.  **Visualización**: Tanto en Admin como en el Dashboard de usuario, al hacer clic en un ítem, el sistema decide si abrir un link externo o solicitar a Supabase un enlace de acceso temporal para un archivo privado.

---
*Implementado por Antigravity para Telmark Admin Panel.*
