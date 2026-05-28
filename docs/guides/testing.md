# Guía de Testing

El proyecto utiliza **Vitest** como framework de testing. Todos los tests deben ejecutarse sin depender de variables de entorno reales, utilizando mocks para la base de datos (PostgreSQL/Drizzle) y para Supabase.

## Estructura de Tests

La carpeta principal es `test/`, dividida de la siguiente manera:
- `test/setup.ts`: Configuración global de Vitest y mocks.
- `test/unit/`: Tests unitarios.
  - `actions/`: Tests para las Server Actions.
  - `middlewares/`: Tests para los middlewares y auth guards.
  - `utils.test.ts`: Tests para utilidades varias.

## Ejecución de Tests

Para correr la suite de tests completa:
```bash
npm run test
```

Para correr en modo observador (watch):
```bash
npx vitest watch
```

## Escribir un Nuevo Test

Utiliza las funciones estándar de Vitest (`describe`, `it`, `expect`, `vi`).
Asegúrate de:
1. No usar dependencias reales (mockea `db` y `supabase`).
2. Aislar tus pruebas con `beforeEach` limpiando mocks (`vi.clearAllMocks()`).
3. Si un test revela un bug en la base de código, incluye un comentario `// BUG:` y déjalo como `.skip()` si no se va a reparar de inmediato para que no rompa el CI.

Ejemplo de mock:
```ts
vi.mock('@/db', () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([])
    }
}))
```
