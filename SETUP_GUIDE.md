# Guía de Configuración: Next.js (Fullstack) - CMS Telmark

Este documento registra los pasos seguidos para la inicialización del proyecto.

## Paso 1: Inicialización de Next.js
Comando utilizado:
```powershell
npx create-next-app@latest admin-panel
```
Configuración elegida:
- TypeScript, ESLint, Tailwind CSS, App Router, src/ directory, Turbopack, React Compiler.
- Los archivos se movieron posteriormente a la raíz del repositorio.

## Paso 2: Instalación de la UI (Shadcn/UI & Lucide)
Para el sistema de diseño e iconos:
```powershell
npm install lucide-react
npx shadcn@latest init -d
```

## Paso 3: Configuración de Supabase
Librerías para el backend y auth:
```powershell
npm install @supabase/ssr @supabase/supabase-js
```

## Paso 4: Comandos Útiles
- **Desarrollo**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
