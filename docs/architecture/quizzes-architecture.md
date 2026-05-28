# Arquitectura Modular del Sistema de Cuestionarios

Este documento detalla la estructura de componentes adoptada para resolver la complejidad de las páginas de cuestionarios, garantizando que el código sea mantenible, testeable y fácil de entender.

## 1. Patrón de Diseño: Responsabilidad Única
En lugar de tener archivos `page.tsx` de 600+ líneas, hemos movido la interfaz visual a sub-componentes especializados dentro de carpetas `components/` locales a cada ruta. La página actúa únicamente como **Orquestador** (gestión de estado y datos).

## 2. Desglose de Módulos

### A. Dashboard de Resultados (`[quizId]/results/`)
El dashboard analítico se ha dividido en secciones lógicas:
- **`StatCard`**: Componente genérico para métricas clave.
- **`OverviewTab`**: Vista de resumen con gráficos de temas y destacados.
- **`RankingTab`**: Gestión de la tabla de clasificación.
- **`TopicsTab`**: Tarjetas de asimilación por área de conocimiento.
- **`QuestionsTab`**: Mapa de calor de rendimiento por pregunta.

### B. Motor de Cuestionarios (Preview y Alumno)
Para estandarizar el flujo del examen, se han creado componentes de "Fase":
- **`IntroPhase`**: Preparación y metadatos del quiz.
- **`QuizPhase`**: El bucle principal de preguntas con soporte para multimedia y temporizador.
- **`PersonalResults`**: Resumen individual de puntuación y revisión de respuestas.

### C. Editor de Cuestionarios (`[quizId]/page.tsx`)
Separación de la gestión administrativa:
- **`QuizEditorHeader`**: Configuración global y acciones principales.
- **`QuestionList`**: Orquestador de la lista de preguntas.
- **`QuestionItem`**: Lógica de visualización y acciones rápidas de cada pregunta.
- **`QuestionForm`**: El editor granular de preguntas (previamente modularizado).

## 3. Ventajas de esta Arquitectura
- **Mantenibilidad**: Los archivos tienen una media de 120 líneas, facilitando la localización de errores.
- **Colaboración**: Diferentes desarrolladores pueden trabajar en diferentes componentes sin conflictos en el archivo principal.
- **Reutilización**: Componentes como `IntroPhase` o `QuizPhase` son compartidos con lógica casi idéntica entre el panel de administración y el de usuario.

---

> [!TIP]
> Al añadir nuevas funcionalidades, siempre busca crear un nuevo componente en la carpeta `components/` local en lugar de añadir lógica visual directamente en el `page.tsx`.
