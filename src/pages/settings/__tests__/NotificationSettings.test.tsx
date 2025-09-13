import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { NotificationSettings } from '../NotificationSettings'
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
const mockUpsert = vi.fn()
const mockSupabase = {
  from: vi.fn(() => ({
    upsert: mockUpsert,
  })),
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

// Mock de sonner
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
}

vi.mock('sonner', () => ({
  toast: mockToast,
}))

describe('NotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar el formulario de configuraciones de notificaciones', () => {
    render(
      <SupabaseAuthProvider>
        <NotificationSettings />
      </SupabaseAuthProvider>
    )

    expect(screen.getByText('Configuración de Notificaciones')).toBeInTheDocument()
    expect(screen.getByText('Notificaciones por Email')).toBeInTheDocument()
    expect(screen.getByText('Notificaciones Push')).toBeInTheDocument()
    expect(screen.getByText('Notificaciones In-App')).toBeInTheDocument()
  })

  it('debería guardar las configuraciones correctamente', async () => {
    mockUpsert.mockResolvedValue({ error: null })

    render(
      <SupabaseAuthProvider>
        <NotificationSettings />
      </SupabaseAuthProvider>
    )

    // Encontrar y hacer clic en el botón de guardar
    const saveButton = screen.getByRole('button', { name: /guardar/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        marketing_emails: false,
        updated_at: expect.any(String),
      })
    })

    expect(mockToast.success).toHaveBeenCalledWith('Configuración de notificaciones actualizada')
  })

  it('debería manejar errores al guardar', async () => {
    const mockError = new Error('Database error')
    mockUpsert.mockResolvedValue({ error: mockError })

    render(
      <SupabaseAuthProvider>
        <NotificationSettings />
      </SupabaseAuthProvider>
    )

    const saveButton = screen.getByRole('button', { name: /guardar/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Error al actualizar las notificaciones')
    })
  })

  it('debería mostrar error si no hay usuario autenticado', async () => {
    const mockAuthContextNoUser = {
      ...mockAuthContext,
      user: null,
    }

    vi.mocked(require('@/contexts/SupabaseAuthContext').useSupabaseAuth).mockReturnValue(mockAuthContextNoUser)

    render(
      <SupabaseAuthProvider>
        <NotificationSettings />
      </SupabaseAuthProvider>
    )

    const saveButton = screen.getByRole('button', { name: /guardar/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Debes estar autenticado para actualizar las configuraciones')
    })
  })
})
