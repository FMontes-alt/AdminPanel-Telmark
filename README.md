# Admin Panel - CMS Telmark

Panel de administración full-stack construido con **Next.js**, **React**, **TailwindCSS** y **Supabase**. Está diseñado para gestionar campañas, usuarios, permisos, y recursos multimedia.

## 🚀 Arquitectura y Tecnologías

- **Frontend**: Next.js (App Router), React Server Components (RSC) y Client Components.
- **Backend/API**: Next.js Server Actions centralizadas en `src/actions/`.
- **Base de Datos**: Supabase (PostgreSQL) con Drizzle ORM.
- **Estilos**: Tailwind CSS + Shadcn/UI + Lucide Icons.
- **Middlewares**: Autenticación y Autorización en Edge (Role Based Access Control).
- **Testing**: Vitest con Mocks de base de datos.

## 📂 Estructura Principal

- `src/app/admin/`: Rutas del panel de administración.
- `src/actions/`: Lógica de negocio encapsulada y Server Actions (Estandarizadas con `ActionResult<T>`).
- `src/components/`: Componentes UI reutilizables.
- `src/lib/`: Utilidades, Auth Guards, Error Handler y Logger.
- `src/db/`: Esquemas de Drizzle ORM y conexión a BD.
- `src/middlewares/`: Middleware de seguridad y control de acceso por roles.
- `docs/`: Documentación del proyecto.
- `test/`: Entorno de pruebas y tests unitarios.

## 📄 Documentación

Consulta el **[Hub de Documentación](docs/INDEX.md)** para obtener detalles sobre la arquitectura, guías de desarrollo y manuales técnicos.
También puedes consultar la **Auditoría Técnica** en `AUDITORIA.md` y el **Plan de Acción** en `PLAN_ACTUACION.md`.
Tenemos también guías de testing y deployment en la carpeta `docs/guides/`.

## ⚙️ Variables de Entorno

Para ejecutar este proyecto, necesitas configurar las siguientes variables de entorno en un archivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="tu-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
DATABASE_URL="postgres://tu-conexion-directa"
```

## 📦 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Correr servidor en desarrollo (localhost:3000)
npm run dev

# Ejecutar tests unitarios (Vitest)
npm run test

# Ejecutar tests con UI interactiva
npm run test -- --ui

# Poblar la base de datos con datos de prueba
npm run seed

# Ejecutar linter
npm run lint

# Compilar para producción
npm run build
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el panel.
