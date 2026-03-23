# Sistema de Alertas y Eventos (Documentación)

Este módulo gestiona la trazabilidad de eventos críticos en el panel de administración, como la creación, edición, bloqueo y borrado de contenidos.

## 🏗️ Arquitectura del Sistema

El sistema sigue una arquitectura desacoplada en 4 capas:

### 1. Base de Datos (`src/db/schema.ts`)
- **Tabla `alerts`**: Almacena todos los eventos.
- **Campos clave**:
  - `type`: Categoría del evento (`error`, `lock`, `delete`, `create`, `edit`, `system`).
  - `severity`: Gravedad (`info`, `warning`, `critical`).
  - `message`: Texto descriptivo (personalizado vía Servicio).
  - `targetName` / `targetId`: Referencia al objeto afectado (ej: nombre de la sección).
  - `isRead`: Marca de tiempo para gestión de notificaciones vistas.

### 2. Acciones del Servidor (`src/actions/alerts.ts`)
Contiene las funciones base de interacción con la BD (el "Controller" de bajo nivel):
- `createAlert`: Inserta una nueva alerta y revalida la ruta del panel.
- `getAlerts`: Recupera las últimas 50 alertas ordenadas por fecha.
- `markAlertAsRead`: Actualiza el estado de lectura de una alerta.

### 3. Capa de Servicio (`src/services/alert-services.ts`)
Es el **Diccionario de Mensajes Estandarizados**. Centraliza el qué y el cómo se comunican los eventos:
- `AlertService.sectionCreated`
- `AlertService.sectionDeleted`
- `AlertService.sectionLocked` / `sectionUnlocked`
- `AlertService.sectionErrorReported` / `sectionErrorFixed`

*Ventaja: Para cambiar un mensaje o icono, solo se toca este archivo.*

### 4. Interfaz de Usuario (`src/app/admin/alerts/`)
Panel premium modularizado para la visualización de eventos:
- `page.tsx`: Orquestador de la vista.
- `components/AlertsHeader.tsx`: Estadísticas rápidas y títulos.
- `components/AlertsFilters.tsx`: Buscador y filtrado por tipos.
- `components/AlertsList.tsx`: Manejo de estados (Carga, Vacío, Lista).
- `components/AlertItem.tsx`: Visualización individual con animaciones y acciones rápidas.

---

## 🚀 Cómo integrar nuevas alertas

Para registrar un nuevo evento en cualquier parte de la aplicación:

1. Importa el servicio:
```typescript
import { AlertService } from "@/services/alert-services"
```

2. Llama al método correspondiente:
```typescript
await AlertService.sectionDeleted(name, id)
```

## 🛠️ Tecnologías utilizadas
- **Drizzle ORM**: Consultas y validación de tipos.
- **Framer Motion**: Animaciones fluidas en la UI.
- **Lucide React**: Iconografía semántica.
- **Date-fns**: Formateo de fechas relativas (ej: "hace 5 minutos").
- **Tailwind CSS**: Estilizado premium y responsive.
