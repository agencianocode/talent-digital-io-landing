import { describe, it, expect, vi } from 'vitest'

// Test simple sin renderizado para verificar que el componente existe
describe('LogoutButton', () => {
  it('debería existir el componente LogoutButton', () => {
    // Verificar que podemos importar el componente
    expect(() => {
      require('../LogoutButton')
    }).not.toThrow()
  })

  it('debería tener la estructura correcta', () => {
    const LogoutButton = require('../LogoutButton').default
    
    // Verificar que es una función (componente React)
    expect(typeof LogoutButton).toBe('function')
  })
})
