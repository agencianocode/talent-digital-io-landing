import { describe, it, expect } from 'vitest'
import { validationPatterns, validateField, validateForm } from '../validation'

describe('validationPatterns', () => {
  describe('email', () => {
    it('debería validar emails correctos', () => {
      expect(validationPatterns.email.test('test@example.com')).toBe(true)
      expect(validationPatterns.email.test('user.name@domain.co.uk')).toBe(true)
    })

    it('debería rechazar emails incorrectos', () => {
      expect(validationPatterns.email.test('invalid-email')).toBe(false)
      expect(validationPatterns.email.test('test@')).toBe(false)
      expect(validationPatterns.email.test('@example.com')).toBe(false)
    })
  })

  describe('phone', () => {
    it('debería validar números de teléfono correctos', () => {
      expect(validationPatterns.phone.test('+1234567890')).toBe(true)
      expect(validationPatterns.phone.test('1234567890')).toBe(true)
    })

    it('debería rechazar números de teléfono incorrectos', () => {
      expect(validationPatterns.phone.test('0123')).toBe(false)
      expect(validationPatterns.phone.test('abc123')).toBe(false)
    })
  })

  describe('url', () => {
    it('debería validar URLs correctas', () => {
      expect(validationPatterns.url.test('https://example.com')).toBe(true)
      expect(validationPatterns.url.test('http://example.com/path')).toBe(true)
    })

    it('debería rechazar URLs incorrectas', () => {
      expect(validationPatterns.url.test('not-a-url')).toBe(false)
      expect(validationPatterns.url.test('ftp://example.com')).toBe(false)
    })
  })

  describe('linkedin', () => {
    it('debería validar URLs de LinkedIn correctas', () => {
      expect(validationPatterns.linkedin.test('https://linkedin.com/in/username')).toBe(true)
      expect(validationPatterns.linkedin.test('https://www.linkedin.com/in/username/')).toBe(true)
    })

    it('debería rechazar URLs de LinkedIn incorrectas', () => {
      expect(validationPatterns.linkedin.test('https://facebook.com/username')).toBe(false)
      expect(validationPatterns.linkedin.test('https://linkedin.com/company/username')).toBe(false)
    })
  })
})

describe('validateField', () => {
  it('debería validar campo requerido', () => {
    const rule = { required: true }
    expect(validateField('', rule)).toBe('Este campo es requerido')
    expect(validateField('value', rule)).toBeNull()
  })

  it('debería validar longitud mínima', () => {
    const rule = { minLength: 5 }
    expect(validateField('abc', rule)).toBe('Debe tener al menos 5 caracteres')
    expect(validateField('abcdef', rule)).toBeNull()
  })

  it('debería validar longitud máxima', () => {
    const rule = { maxLength: 10 }
    expect(validateField('abcdefghijk', rule)).toBe('No puede tener más de 10 caracteres')
    expect(validateField('abcdef', rule)).toBeNull()
  })

  it('debería validar patrón', () => {
    const rule = { pattern: /^[A-Z]+$/ }
    expect(validateField('abc', rule)).toBe('Formato inválido')
    expect(validateField('ABC', rule)).toBeNull()
  })

  it('debería validar función personalizada', () => {
    const rule = { 
      custom: (value: unknown) => {
        if (typeof value === 'string' && value.includes('test')) {
          return null
        }
        return 'Debe contener "test"'
      }
    }
    expect(validateField('hello', rule)).toBe('Debe contener "test"')
    expect(validateField('test123', rule)).toBeNull()
  })
})

describe('validateForm', () => {
  it('debería validar formulario completo', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    }

    const rules = {
      name: { required: true, minLength: 2 },
      email: { required: true, pattern: validationPatterns.email },
      phone: { required: true, pattern: validationPatterns.phone }
    }

    const errors = validateForm(data, rules)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('debería detectar errores en formulario', () => {
    const data = {
      name: '',
      email: 'invalid-email',
      phone: '123'
    }

    const rules = {
      name: { required: true, minLength: 2 },
      email: { required: true, pattern: validationPatterns.email },
      phone: { required: true, pattern: validationPatterns.phone }
    }

    const errors = validateForm(data, rules)
    expect(Object.keys(errors).length).toBeGreaterThan(0)
    expect(errors.name).toBe('Este campo es requerido')
    expect(errors.email).toBe('Formato inválido')
    expect(errors.phone).toBe('Formato inválido')
  })
})
