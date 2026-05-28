# Diseño de la BBDD: Estructura Escalable y Genérica

Este documento detalla la arquitectura de la base de datos para la plataforma CMS Telmark.

## 1. Filosofía del Diseño

El sistema está diseñado para ser **genérico** y **escalable**, permitiendo gestionar diferentes tipos de información (Adeslas, Energía, Alarma) bajo una misma estructura de jerarquía y un avanzado sistema de permisos.

### ¿Por qué UUID?

- **Seguridad**: Los IDs no son predecibles en las URLs.
- **Escalabilidad**: Evita colisiones al sincronizar datos entre diferentes entornos.

## 2. Diagrama Entidad-Relación (ERD)

### Estructura Técnica (Mermaid)

```mermaid
erDiagram
    PROFILES ||--o{ USER_GROUPS : "pertenece a"
    PROFILES ||--o{ PERMISSIONS : "tiene directos"
    PROFILES ||--o{ ALERTS : "genera"
    
    GROUPS ||--o{ USER_GROUPS : "agrupa"
    GROUPS ||--o{ PERMISSIONS : "tiene de grupo"
    
    SECTIONS ||--o{ CATEGORIES : "contiene"
    CATEGORIES ||--o{ SUBCATEGORIES : "contiene"
    SUBCATEGORIES ||--o{ ITEMS : "contiene"
    
    PERMISSIONS }o--|| SECTIONS : "target_type=section"
    PERMISSIONS }o--|| CATEGORIES : "target_type=category"
    PERMISSIONS }o--|| SUBCATEGORIES : "target_type=subcategory"
    PERMISSIONS }o--|| ITEMS : "target_type=item"

    PROFILES {
        uuid id PK
        text first_name
        text last_name
        text email UK
        enum role "superadmin|admin|usuario"
    }
    
    SECTIONS {
        uuid id PK
        text name
        text slug UK
        jsonb config
    }
    
    ITEMS {
        uuid id PK
        uuid subcategory_id FK
        text title
        enum content_type "info|document|file|link|video"
        jsonb attributes
    }
    
    PERMISSIONS {
        uuid id PK
        uuid user_id FK
        uuid group_id FK
        enum target_type "section|category|subcategory|item"
        uuid target_id
    }
    
    ALERTS {
        uuid id PK
        enum type "7 tipos"
        enum severity "info|warning|critical"
    }
    
    QUIZZES ||--o{ QUIZ_QUESTIONS : "contiene"
    QUIZ_QUESTIONS ||--o{ QUIZ_OPTIONS : "tiene"
    PROFILES ||--o{ QUIZ_ATTEMPTS : "realiza"
    QUIZ_ATTEMPTS ||--o{ QUIZ_ANSWERS : "contiene"
```

## 3. Flexibilidad con `jsonb`

Las columnas `config` (en SECTIONS) y `attributes` (en ITEMS) permiten guardar datos dinámicos sin necesidad de modificar las tablas. Esto garantiza que el sistema pueda adaptarse a nuevos requisitos sin cambios en el código base del backend.

## 4. Notas sobre Drizzle ORM

Actualmente, el proyecto utiliza **Drizzle ORM** como motor principal de acceso a datos para Server Actions, mientras que la autenticación recae directamente sobre el cliente de Supabase (GoTrue). La base de datos y sus migraciones se manejan vía Drizzle.

---

## 🗺️ Navegación: Arquitectura
- 🔙 **[Volver al Hub](../INDEX.md)**
- 🔐 **[Seguridad y RLS](security-rls.md)**
- ⚙️ **[Middleware](middleware.md)**

*Última actualización: 28 de Mayo de 2026*
