# Implementación del Sistema de Cuestionarios (Quizzes)

Este documento describe el desarrollo y las funcionalidades del módulo de Cuestionarios, diseñado para la evaluación y formación dentro de la plataforma AdminPanel-Telmark.

## 1. Gestión Administrativa de Cuestionarios
Se ha implementado una interfaz completa de administración en `src/app/admin/quizzes` que permite el ciclo de vida completo (CRUD) de las evaluaciones.

### Configuración Global
- **Metadatos**: Título y descripción detallada.
- **Categorización**: Vinculación obligatoria a una Sección/Categoría para organizar el contenido.
- **Temporizador**: Capacidad de definir un tiempo límite en minutos para realizar el cuestionario.
- **Aleatorización**: Opción para mostrar las preguntas en orden aleatorio para cada intento.
- **Estado de Publicación**: Control de visibilidad (Borrador vs. Publicado) mediante un interruptor dinámico.

## 2. Editor de Preguntas con Categorización por Temas
El editor (`src/app/admin/quizzes/[quizId]/page.tsx`) permite gestionar el contenido pedagógico con gran detalle:

### Tipos de Preguntas Soportados:
- **Opción Única**: Selección de una respuesta entre varias.
- **Multi-Respuesta**: Marcado de múltiples opciones correctas con límite configurable.
- **Verdadero / Falso**: Formato simplificado de dos opciones.
- **Respuesta Corta**: Campo de texto libre para respuestas abiertas.

### Etiquetas de Temas (Knowledge Areas):
Cada pregunta puede ser etiquetada con un **Tema** (ej: "Procesos", "Producto", "Legales"). Esto permite que el sistema de analíticas agrupe los aciertos y errores por área de conocimiento, identificando debilidades específicas del alumno.

### Integración Multimedia Avanzada:
- **Detección Automática**: Reconoce imagen o vídeo para adaptar la visualización.
- **Seguridad**: Uso de URLs firmadas temporales resueltas dinámicamente desde Supabase Storage.

## 3. Modo Previsualización y Motor de Examen
El motor de cuestionarios (`src/app/admin/quizzes/[quizId]/preview/page.tsx` y versión de usuario) ofrece una experiencia de alta fidelidad:
- **Layout Fijo**: Botones de navegación siempre visibles (sticky layout).
- **Barra de Progreso**: Indicador visual superior del avance real.
- **Temporizador Inteligente**: Alertas visuales cuando queda menos de un minuto.
- **Navegación Fluida**: Botón de "Volver a Cuestionarios" integrado para un flujo de trabajo sin interrupciones.

## 4. Dashboard de Analíticas Avanzadas
La sección de resultados se ha transformado en un centro de datos educativos dividido en 4 pilares:
1.  **Resumen (Overview)**: Métricas globales (éxito medio, participación) y gráficos de barras por Temas. Identificación automática del "Punto Crítico" (área con peor rendimiento).
2.  **Clasificación (Ranking)**: Top 10 de usuarios basado en precisión y puntuación.
3.  **Análisis por Temas**: Feedback cualitativo generado automáticamente según el porcentaje de asimilación de cada área.
4.  **Mapa de Preguntas (Heatmap)**: Desglose individual por pregunta para detectar enunciados confusos o conceptos mal explicados.

## 5. Sistema de Calificación
Al finalizar un cuestionario en modo prueba, se genera un resumen de resultados detallado:
- **Puntuación porcentual** con feedback visual basado en el rendimiento (verde/ámbar/rojo).
- **Revisión pregunta por pregunta**, indicando qué respondió el usuario, cuál era la correcta y si el sistema la marcó como acertada.

## 6. Arquitectura Técnica y Modularidad
- **Base de Datos**: Esquema relacional con Drizzle ORM incluyendo tablas para seguimiento de intentos y respuestas individuales.
- **Acciones del Servidor (Server Actions)**: 
  - `src/actions/quizzes.ts`: Gestión de niveles lógicos de cuestionarios.
  - `src/actions/quiz-questions.ts`: CRUD profundo de preguntas y sus opciones.
  - `src/actions/quiz-attempts.ts`: Lógica de negocio para iniciar, guardar respuestas parciales y calcular resultados finales.
- **Seguridad Multimedia**: Uso de `getSignedUrlAction` de Supabase para servir archivos privados.
- **Modularización**: Para mantener la escalabilidad, las páginas complejas se han dividido en sub-componentes especializados (ver `docs/architecture/quizzes-architecture.md`).
- **Lógica de Servidor**: Server Actions dedicados para CRUD, estadísticas y gestión de intentos.
