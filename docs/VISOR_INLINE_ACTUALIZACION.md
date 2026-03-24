# Implementación del Visor Inline de Contenido (Master-Detail)

Este documento detalla todas las actualizaciones y mejoras realizadas hoy en el sistema de visualización de contenido multimedia y documentos, tanto para el Panel de Administración como para el Dashboard público.

## 1. Visor Integrado (Inline Viewer)
Se ha sustituido la antigua funcionalidad de "abrir contenido en una pestaña nueva" por un **Visor Inline con diseño Maestro-Detalle**.

- **Dashboard Público** (`src/app/dashboard/[sectionSlug]/page.tsx`): 
  - Al hacer clic en un ítem, en lugar de abrir una pestaña, la cuadrícula de ítems se transforma dinámicamente.
  - El visor ocupa el panel principal (izquierdo, ~65% del ancho).
  - La lista de ítems hermanos se desplaza a un panel lateral derecho (~35% del ancho), permitiendo previsualizar distintos archivos rápidamente sin perder el contexto.
- **Panel de Administración** (`src/app/admin/sections/[slug]/components/SubcategoryCard.tsx`):
  - Se replicó exactamente la misma interfaz y experiencia de usuario que en el Dashboard público.
  - Al seleccionar un ítem en la zona de administración, se abre su previsualización en el visor lateral.

### Características del Visor:
- **Botón de Cierre (X)**: Restaura la vista normal de cuadrícula/lista.
- **Botón de Descarga**: Permite descargar el archivo directamente (si está disponible y tiene URL de descarga).
- **Indicador Visual**: El ítem actualmente activo se resalta en azul claro en el panel lateral.

## 2. Soporte Universal de Formatos
El visor reacciona de forma inteligente al tipo de contenido (`contentType`) y extensión del archivo para renderizar la etiqueta HTML óptima:

- **Imágenes (`.png, .jpg, .webp`...)**: Se usa una etiqueta `<img>` con `object-contain`.
- **Vídeos Locales / Supabase (`video` o `.mp4, .mkv`...)**: Se utiliza un reproductor de HTML5 nativo `<video controls src="...">` para evitar bloqueos por políticas de iFrames.
- **PDFs (`.pdf` o `document`)**: Se renderizan limpiamente dentro de un `<iframe src="...">`.
- **Texto / Info (`info`)**: Se renderiza en un contenedor nativo con soporte para `prose` y scroll.
- **Enlaces Externos (`link` y URLs de Youtube/Vimeo)**: Se usa un `<iframe>` genérico con soporte a adaptaciones específicas.

## 3. Correcciones de Seguridad y CSP (Content-Security-Policy)
Se corrigieron problemas críticos donde los visores de PDFs y vídeos mostraban un error de **"Este contenido está bloqueado"** (con un icono de archivo triste en el navegador). El problema residía en políticas de seguridad estrictas (tanto de Next.js como de Supabase).

- **Actualización de `src/middlewares/security.ts`**:
  - Se añadió `frame-src 'self' https: http: blob: data:;` para permitir la incrustación de iFrames provenientes de cualquier fuente segura externa (indispensable para Youtube, Vimeo y PDFs).
  - Se agregó soporte para contenido dinámico de Supabase en `media-src`, `connect-src` e `img-src` añadiendo reglas universales como `blob:` y `data:`.

## 4. Bypass de X-Frame-Options para PDFs (Supabase)
Supabase Storage protege las URLs privadas firmadas aplicando cabeceras `X-Frame-Options: SAMEORIGIN` o forzando la descarga del documento, lo que originaba fallos al intentar mostrarlos dentro de un `iframe` interno. 

- **Solución implementada**: Mediante JavaScript dinámico, el archivo se obtiene (`fetch`) usando la URL firmada. Se transforma en un Blob y finalmente se inyecta en el iFrame utilizando una URL de objeto local seguro (`URL.createObjectURL(blob)`). Esto salta la restricción de seguridad de Supabase y visualiza el PDF fluidamente.

## 5. Convertidor Automático de Links de YouTube
Al subir como enlace externo una URL común de visualización de YouTube (`https://www.youtube.com/watch?v=abcd`), los visores de iFrames rechazan la conexión. 

- Se creó la función `getEmbedUrl(url)` que **extrae el ID del vídeo de la URL normal** de un usuario y lo transforma en el formato estándar incrustable (`https://www.youtube.com/embed/abcd`) para asegurar la visualización inline sin romper el marco de la página. (También incluye soporte para Vimeo).

## 6. Resolución de Problemas de Flexbox y Layout Responsive
El rediseño creó problemas en las proporciones de visualización ("aplastamiento" de tarjetas y desbordamiento de textos en la vista Admin). Soluciones:

- **Reestructuración a 1 Columna en Categorías**: En `CategoryItem.tsx` (Admin), se abandonó el sistema limitante de dos columnas (`lg:grid-cols-2`) al mostrar las Subcategorías. Esto garantiza que la tarjeta de la subcategoría tenga el 100% del ancho de la pantalla, dándole suficiente espacio al visor para respirar.
- **Fix Overflow (Contenedores Flex)**: Se reemplazaron delimitadores rígidos (como `min-w-[280px]`) que forzaban la rotura de límites en contenedores `max-w-6xl`. Se introdujeron contenedores estrictos con clases `w-[65%]` (visor) y `w-[35%]` (lista), combinados con `flex-1`, `flex-shrink-0` y `min-w-0` en los elementos internos de `ContentItem.tsx` para permitir truncamiento suave del texto (recorte automático con `...`) sin deformar la caja padre.
