import { vi } from 'vitest'

// Mock de la base de datos (drizzle)
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    query: {
        profiles: {
            findFirst: vi.fn()
        },
        sections: {
            findFirst: vi.fn()
        }
    },
    transaction: vi.fn(async (cb) => {
        // Mock simple tx context
        return cb({
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{ id: "mock-id" }]),
        })
    })
  }
}))

// Mock de next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

// Mock de supabase client
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
        }
    }))
}))

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
        }
    }))
}))
