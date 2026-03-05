# Documentación de Backend: Supabase + Drizzle ORM

Este documento detalla cómo se ha configurado la conexión con la base de datos y por qué hemos elegido estas herramientas.

## ¿Qué hemos montado?

Hemos pasado de una conexión básica a una **arquitectura moderna Fullstack** usando:
1. **Supabase**: Nuestra base de datos Postgres en la nube.
2. **Drizzle ORM**: El "traductor" que nos permite hablar con la base de datos usando código TypeScript en lugar de solo SQL.

## ¿Para qué sirve Drizzle ORM? (El "Por qué")

Imagina que la base de datos es un almacén gigante. 
- **Sin Drizzle**: Tendrías que entrar tú mismo (escribir SQL), buscar la caja correcta y rezar para no equivocarte de nombre. Si escribes "Sections" en lugar de "sections", el programa falla en el último momento.
- **Con Drizzle**: Es como tener un robot inteligente que conoce cada pasillo del almacén. 
    - **Seguridad**: Si intentas pedir algo que no existe, el robot (VS Code) te avisa antes de que vayas al almacén.
    - **Velocidad**: No tienes que memorizar los nombres de las tablas; el robot te los sugiere todos (Autocompletado).
    - **Mantenimiento**: Si cambias el nombre de una tabla en el código, Drizzle te ayuda a actualizarlo en toda la base de datos de forma segura.

## Archivos Críticos

### 1. Variables de Entorno (`.env.local`)
Contiene las llaves maestras del proyecto. **Nunca subas este archivo a GitHub**.

### 2. Esquema de Datos (`src/db/schema.ts`)
Aquí es donde definimos cómo son nuestras tablas. Es el mapa que usa Drizzle para saber qué datos hay en Supabase.

### 3. Cliente de DB (`src/db/index.ts`)
Es el archivo que importamos en nuestras páginas para hacer consultas:
```typescript
import { db } from '@/db';
const data = await db.select().from(sections);
```

## Próximos Pasos recomendados
1. **Seeding**: Rellenar las tablas con datos iniciales reales.
2. **Server Actions**: Crear las funciones para Insertar, Editar y Borrar desde el panel de administración.
