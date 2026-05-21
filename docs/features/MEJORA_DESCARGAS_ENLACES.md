# Mejora del Sistema de Descargas y Enlaces (Rama: feature/downloads-review)

Este documento detalla las mejoras de Experiencia de Usuario (UX) e integraciones con Supabase Storage realizadas para solucionar problemas con el manejo de archivos y enlaces en la plataforma.

## 1. Descargas Forzadas de Archivos (Imágenes y Vídeos)

### Problema Inicial
Anteriormente, cuando un usuario hacía clic en el botón "Descargar" de un vídeo en formato `.mp4` o de una imagen (subida directamente a la base de datos), el navegador simplemente abría una nueva pestaña reproduciendo el vídeo o mostrando la imagen.
Esto sucedía porque las URLs de Supabase pertenecen a un dominio externo (*Cross-Origin*), por lo que atributos de código HTML nativo como `download="archivo.mp4"` eran ignorados por el navegador web por seguridad.

### Solución Implementada
Se ha creado una nueva Server Action especializada en `src/actions/storage.ts`:

- **Función:** `getDownloadUrlAction(path: string)`
- **Mecanismo:** Aprovecha el motor de firma de Supabase solicitándole una URL con el flag `{ download: true }`.
- **Efecto:** La URL devuelta por el servidor instruye al navegador obligatoriamente mediante la cabecera HTTP `Content-Disposition: attachment`. Cuando el cliente la pulsa, el archivo se descarga automáticamente en la carpeta "Descargas" del ordenador/móvil, evitando abrir pestañas innecesarias.

---

## 2. Iconografía y Lógica Dinámica de Enlaces Externos

### Problema Inicial
Cualquier contenido agregado como "Embebido" (Youtube/Vimeo) o Url externa directa mostraba por defecto el clásico botón con el icono de descargar (`Download`), lo cual era confuso ya que ningún enlace externo de terceros puede descargarse. Además, al pulsarlo realizaba un comportamiento errático.

### Solución Implementada
1. **Detección Contextual**: En los visores del Dashboard público y en el Panel Admin (`SubcategoryViewer`), se ha añadido una lógica que evalúa si el ítem seleccionado es interno (tiene `filePath`) o externo (`externalLink` existente y tipo 'link' o 'video').
2. **Reemplazo Visual**: Si detecta un enlace externo, el botón cambia de un icono de flecha de descarga a una flecha de salida externa (`ExternalLink` de Lucide React), dejando clara la intención. El tooltip emergente (al dejar el ratón encima) también cambia de "Descargar" a "Abrir enlace externo".

---

## 3. Traducción Inversa de URLs de Vídeos Embebidos

### Problema Inicial
Si un usuario pegaba un enlace directo de Youtube, el sistema generaba correctamente el enlace `embed` (ej: `youtube.com/embed/XXXXX`) para previsualizarlo sin salir del Panel de Control.
Sin embargo, al hacer clic en el botón de **Abrir enlace externo**, el sistema abría exactamente esa URL de `embed` en una pestaña limpia. Los marcos técnicos de Youtube rechazan abrir páginas de formato "embed" en navegadores directos sin marco padre, mostrando el error 152 ("Este vídeo no está disponible").

### Solución Implementada
Se desarrolló el traductor inverso `getWatchUrl(url: string)` dentro de los componentes:
- La función intercepta el intento de abrir la página externa en la nueva pestaña.
- Evalúa con Expresiones Regulares si el enlace destino contiene la estructura técnica de YouTube Embed (`youtube.com/embed/`) o Vimeo Embed (`player.vimeo.com/video/`).
- Parsea el ID único del vídeo subyacente y recompone la URL para emular un comportamiento nativo (la devuelve a `youtube.com/watch?v=XXXXX`).
- **Resultado:** Al hacer clic, Youtube abre la pestaña mostrándole el vídeo real de la interfaz oficial con comentarios y sugerencias, impidiendo el error técnico del iframe huérfano.
