import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { LogoutButton } from '../LogoutButton'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'

// Mock del contexto de autenticación
const mockSignOut = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: () => ({
    signOut: mockSignOut,
  }),
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería renderizar el botón de logout', () => {
    render(
      <SupabaseAuthProvider>
        <LogoutButton />
      </SupabaseAuthProvider>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument()
  })

  it('debería llamar signOut cuando se hace clic', async () => {
    mockSignOut.mockResolvedValue(undefined)

    render(
      <SupabaseAuthProvider>
        <LogoutButton />
      </SupabaseAuthProvider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })
  })

  it('debería navegar a la página principal después del logout', async () => {
    mockSignOut.mockResolvedValue(undefined)

    render(
      <SupabaseAuthProvider>
        <LogoutButton />
      </SupabaseAuthProvider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    }, { timeout: 200 })
  })

  it('debería mostrar estado de carga durante el logout', async () => {
    mockSignOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <SupabaseAuthProvider>
        <LogoutButton />
      </SupabaseAuthProvider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Verificar que el botón está deshabilitado durante la carga
    expect(button).toBeDisabled()
  })
})
