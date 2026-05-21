# Admin Panel - CMS Telmark

Panel de administración full-stack construido con **Next.js**, **React**, **TailwindCSS** y **Supabase**.

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

## 📄 Documentación

Consulta el **[Hub de Documentación](docs/INDEX.md)** para obtener detalles sobre la arquitectura, guías de desarrollo y manuales técnicos.
También puedes consultar la **Auditoría Técnica** en `AUDITORIA.md` y el **Plan de Acción** en `PLAN_ACTUACION.md`.

## 📦 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Ejecutar tests
npm test
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el panel.

