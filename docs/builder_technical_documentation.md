# Documentación Técnica: Builder de Campañas Telmark

Esta documentación detalla la arquitectura, el funcionamiento y la estructura de datos del constructor de campañas premium de Telmark.

## 1. Arquitectura del Sistema

El builder sigue un patrón de **Contenedor-Componente** y está altamente atomizado para cumplir con SOLID:

### Nivel 1: Orquestación (`CampaignsBuilder.tsx`)
- Gestiona el estado global de la campaña (`widgets[]`).
- Maneja la lógica de añadir, borrar y actualizar widgets.
- Controla los estados de persistencia (`isSaving`, `isPublishing`).

### Nivel 2: Estructura (`BuilderCanvas.tsx`, `BuilderHeader.tsx`, `BuilderSidebar.tsx`)
- **Header**: Acciones de control global (Borrador/Publicar).
- **Sidebar**: Selector de elementos disponibles (`ElementSelector`).
- **Canvas**: Motor de renderizado basado en `react-grid-layout` con un grid de 24 columnas.

### Nivel 3: Átomos y Fábricas (`CanvasItem.tsx`, `WidgetFactory.tsx`)
- **CanvasItem**: El "wrapper" de cada bloque. Maneja el drag-handle, toolbar y el marco estético.
- **WidgetFactory**: El selector dinámico que decide qué componente de visualización renderizar.

## 2. Estructura de Datos (Type System)

El sistema utiliza TypeScript para garantizar la integridad de los datos de cada widget:

```typescript
export type WidgetType = 'video' | 'text' | 'link' | 'pdf' | 'stat' | 'image';

export interface BaseWidget {
    id: string;
    type: WidgetType;
    x: number; y: number; w: number; h: number; // Posición en grid 24x20
}

export interface CampaignWidget extends BaseWidget {
    data: any; // Información específica de cada tipo (URL, texto, cifras...)
}
```

## 3. Sistema de Layout (Fluid Grid)

El lienzo utiliza un sistema de rejilla densa para maximizar la libertad de diseño:
- **Columnas**: 24 (Horizontal).
- **Altura de Fila**: 20px (Vertical).
- **Márgenes**: 8px (Separación interna).

## 4. Flujo de Persistencia

1. **Guardar Borrador**: Almacena el estado actual en `localStorage` o tabla `drafts` de Supabase.
2. **Publicar**: Realiza una validación de campos obligatorios y transfiere el layout al "Worker" de producción.

## 5. Guía de Rediseño

- **StatWidget**: Enfoque en tipografía bold (`black`) y badges de tendencia dinámicos.
- **LinkWidget**: Botones con gradientes premium (`blue/indigo`) y sombras suaves.
- **Inputs**: Uso de `transparent` y `focus:ring-0` para integrarse con el diseño sin parecer formularios antiguos.
