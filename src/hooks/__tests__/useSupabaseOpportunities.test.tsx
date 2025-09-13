import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useSupabaseOpportunities } from '../useSupabaseOpportunities'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'

// Mock del contexto de autenticación
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
}

const mockAuthContext = {
  user: mockUser,
  userRole: 'talent' as const,
  isAuthenticated: true,
  isLoading: false,
  profile: null,
  company: null,
  session: null,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  updateCompany: vi.fn(),
  createCompany: vi.fn(),
  switchUserType: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
}

vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: () => mockAuthContext,
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock de Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

describe('useSupabaseOpportunities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería inicializar con estado correcto', () => {
    const { result } = renderHook(() => useSupabaseOpportunities())

    expect(result.current.opportunities).toEqual([])
    expect(result.current.applications).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('debería cargar oportunidades al montar', async () => {
    const mockOpportunities = [
      {
        id: '1',
        title: 'Test Opportunity',
        description: 'Test Description',
        requirements: 'Test Requirements',
        location: 'Test Location',
        type: 'full-time',
        category: 'marketing',
        salary_min: 50000,
        salary_max: 70000,
        currency: 'USD',
        status: 'active' as const,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        company_id: 'company-1',
      },
    ]

    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockOpportunities, error: null })),
        })),
      })),
    })

    const { result } = renderHook(() => useSupabaseOpportunities())

    await waitFor(() => {
      expect(result.current.opportunities).toEqual(mockOpportunities)
    })
  })

  it('debería manejar errores al cargar oportunidades', async () => {
    const mockError = new Error('Failed to fetch opportunities')
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
        })),
      })),
    })

    const { result } = renderHook(() => useSupabaseOpportunities())

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch opportunities')
    })
  })

  it('debería aplicar a una oportunidad correctamente', async () => {
    const mockApplyToOpportunity = vi.fn()
    
    const { result } = renderHook(() => useSupabaseOpportunities())
    
    // Simular la función applyToOpportunity
    result.current.applyToOpportunity = mockApplyToOpportunity

    await result.current.applyToOpportunity('opportunity-id', 'cover-letter')

    expect(mockApplyToOpportunity).toHaveBeenCalledWith('opportunity-id', 'cover-letter')
  })
})
