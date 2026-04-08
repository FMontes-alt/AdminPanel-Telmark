# Implementación del Sistema de Cuestionarios (Quizzes)

Este documento describe el desarrollo y las funcionalidades del nuevo módulo de Cuestionarios, diseñado para la evaluación y formación dentro de la plataforma AdminPanel-Telmark.

## 1. Gestión Administrativa de Cuestionarios
Se ha implementado una interfaz completa de administración en `src/app/admin/quizzes` que permite el ciclo de vida completo (CRUD) de las evaluaciones.

### Configuración Global
- **Metadatos**: Título y descripción detallada.
- **Temporizador**: Capacidad de definir un tiempo límite en minutos para realizar el cuestionario.
- **Aleatorización**: Opción para mostrar las preguntas en orden aleatorio para cada intento.
- **Estado de Publicación**: Control de visibilidad (Borrador vs. Publicado) mediante un interruptor dinámico.

## 2. Editor de Preguntas Inteligente
El editor (`src/app/admin/quizzes/[quizId]/page.tsx`) permite gestionar el contenido pedagógico con gran flexibilidad:

### Tipos de Preguntas Soportados:
- **Opción Única**: Selección de una respuesta entre varias.
- **Multi-Respuesta**: Marcado de múltiples opciones correctas con límite configurable de selecciones.
- **Verdadero / Falso**: Formato simplificado de dos opciones.
- **Respuesta Corta**: Campo de texto libre para respuestas abiertas.

### Integración Multimedia Avanzada:
Se ha integrado un sistema robusto de carga de archivos directamente a **Supabase Storage**:
- **Detección Automática**: Reconoce si el archivo es imagen o vídeo para adaptar la visualización.
- **Resolución de URLs Firmadas**: El sistema no almacena URLs públicas, sino rutas internas seguras. Tanto el editor como la previsualización resuelven estas rutas en **URLs firmadas temporales** dinámicamente, garantizando la seguridad del contenido multimedia.
- **Vista Previa en Edición**: Al editar una pregunta existente, se muestra una miniatura del archivo cargado actualmente antes de decidir si reemplazarlo.

## 3. Modo Previsualización (Preview)
Ubicado en `src/app/admin/quizzes/[quizId]/preview/page.tsx`, este modo permite a los administradores probar la experiencia exacta que tendrá el usuario final.

### Mejoras de UX/UI en la Previsualización:
- **Layout Fijo**: Se ha modificado el diseño para que los botones de navegación (**Anterior, Siguiente, Finalizar**) estén siempre visibles en la parte inferior de la pantalla (sticky layout), eliminando la necesidad de hacer scroll infinito en preguntas con mucho contenido.
- **Contenido Adaptable**: El área central de la pregunta cuenta con scroll independiente si el texto o la multimedia son muy extensos.
- **Barra de Progreso**: Indicador visual superior del avance real del cuestionario.
- **Temporizador en Tiempo Real**: Sincronizado con la configuración del cuestionario, con alertas visuales (parpadeo en rojo) cuando queda menos de un minuto.

## 4. Arquitectura Técnica
- **Base de Datos**: Esquema diseñado en `src/db/schema.ts` utilizando Drizzle ORM, incluyendo tablas para `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts` y `quiz_answers`.
- **Acciones del Servidor (Server Actions)**: 
  - `src/actions/quizzes.ts`: Gestión de niveles lógicos de cuestionarios.
  - `src/actions/quiz-questions.ts`: CRUD profundo de preguntas y sus opciones.
  - `src/actions/quiz-attempts.ts`: Lógica de negocio para iniciar, guardar respuestas parciales y calcular resultados finales.
- **Seguridad Multimedia**: Uso de `getSignedUrlAction` de Supabase para servir archivos privados.

## 5. Sistema de Calificación
Al finalizar un cuestionario en modo prueba, se genera un resumen de resultados detallado:
- **Puntuación porcentual** con feedback visual basado en el rendimiento (verde/ámbar/rojo).
- **Revisión pregunta por pregunta**, indicando qué respondió el usuario, cuál era la correcta y si el sistema la marcó como acertada.
