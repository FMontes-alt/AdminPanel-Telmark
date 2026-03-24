# Guía de Seeders y Factories

Este documento explica cómo funciona el sistema para poblar la base de datos con datos iniciales (Data Seeding) usando Drizzle ORM.

## 1. ¿Cómo funciona?

Hemos dividido la lógica en dos archivos principales dentro de `src/db/`:

- **`factories.ts`**: Contiene la "materia prima". Son funciones que devuelven *arrays* de objetos con el formato exacto que espera Drizzle para cada tabla. Aquí están los datos ficticios/iniciales de Telmark (Adeslas, Energía, Alarma). Si quieres cambiar los datos generados, este es el único archivo que debes editar.
- **`seed.ts`**: Es el "motor" que ejecuta las inserciones. Se conecta a la base de datos, limpia las tablas existentes y luego va insertando los datos tabla por tabla, enlazando correctamente las claves foráneas (Foreign Keys) en cascada.

## 2. ¿Cómo se ejecuta?

En el `package.json` hemos configurado un script dedicado. Para ejecutar el seeding, simplemente abre tu terminal en la raíz del proyecto y lanza:

```bash
npm run seed
```

Esto ejecutará internamente temporalmente `tsx src/db/seed.ts` leyendo automáticamente las variables de entorno de `.env.local`.

> **⚠️ IMPORTANTE**: El script de seeding limpia **TODAS** las tablas (hace un *delete* total) antes de insertar los nuevos datos. Es totalmente seguro correrlo varias veces en desarrollo, pero borrará cualquier cambio manual que hayas hecho en los datos desde Drizzle Studio.

## 3. ¿Por qué NO se insertan Usuarios (Profiles)?

Verás en el código que el paso de *Perfiles (Profiles)* está omitido. Esto fue una decisión técnica importante:

La tabla `profiles` tiene una clave foránea que apunta directamente a `auth.users`, la cual es una tabla interna gestionada de forma estricta por Supabase. 

Como el registro de usuarios está automatizado a través de un **Trigger de Supabase** (que crea automáticamente un perfil cada vez que un usuario se da de alta en el sistema de Auth), no podemos insertar UUIDs aleatorios por código en nuestra tabla de perfiles. Supabase bloquearía la inserción por violación de la restricción de clave foránea. 

La tabla `profiles` (y sus asignaciones en `profile_sections`) **se nutrirá del flujo real de registro de la aplicación**.

## 4. ¿Cómo escalar esto en el futuro?

El sistema está preparado para crecer. Si en el futuro **añades una nueva tabla** al esquema (por ejemplo, `reportes`), solo necesitas seguir 3 pasos:

1. Edita `src/db/factories.ts`: Crea una nueva función y su tipo asociado (ej: `createReportes(): ReporteSeed[]`).
2. Edita `src/db/seed.ts`: 
   - Añade el código de limpieza al inicio del archivo: `await db.delete(schema.reportes);` (Recuerda ponerlo por encima de las tablas de las que dependa).
   - Añade el paso de inserción utilizando los datos del factory.
3. Vuelve a ejecutar `npm run seed`.

---

## 🗺️ Navegación: Guías
- 🔙 **[Volver al Hub](../INDEX.md)**
- 🚀 **[Setup inicial](setup.md)**
- ⚡ **[API & Server Actions](api-actions.md)**

*Última actualización: 2026-03-24*
