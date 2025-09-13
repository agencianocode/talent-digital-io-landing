import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from '../logger'

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('en desarrollo', () => {
    beforeEach(() => {
      // Simular entorno de desarrollo
      vi.stubEnv('NODE_ENV', 'development')
    })

    it('debería loggear mensajes de debug', () => {
      logger.debug('Debug message', { data: 'test' })
      expect(console.log).toHaveBeenCalledWith('[DEBUG] Debug message', { data: 'test' })
    })

    it('debería loggear mensajes de info', () => {
      logger.info('Info message', { data: 'test' })
      expect(console.info).toHaveBeenCalledWith('[INFO] Info message', { data: 'test' })
    })

    it('debería loggear mensajes de warning', () => {
      logger.warn('Warning message', { data: 'test' })
      expect(console.warn).toHaveBeenCalledWith('[WARN] Warning message', { data: 'test' })
    })

    it('debería loggear mensajes de error', () => {
      const error = new Error('Test error')
      logger.error('Error message', error, { data: 'test' })
      expect(console.error).toHaveBeenCalledWith('[ERROR] Error message', error, { data: 'test' })
    })
  })

  describe('en producción', () => {
    beforeEach(() => {
      // Simular entorno de producción
      vi.stubEnv('NODE_ENV', 'production')
    })

    it('NO debería loggear mensajes de debug en producción', () => {
      logger.debug('Debug message', { data: 'test' })
      expect(console.log).not.toHaveBeenCalled()
    })

    it('NO debería loggear mensajes de info en producción', () => {
      logger.info('Info message', { data: 'test' })
      expect(console.log).not.toHaveBeenCalled()
    })

    it('debería loggear solo warnings y errors en producción', () => {
      logger.warn('Warning message', { data: 'test' })
      logger.error('Error message', new Error('Test'), { data: 'test' })
      
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'Warning message', { data: 'test' })
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Error message', expect.any(Error), { data: 'test' })
    })
  })

  describe('manejo de argumentos', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development')
    })

    it('debería manejar múltiples argumentos', () => {
      logger.info('Message', 'arg1', 'arg2', { data: 'test' })
      expect(console.log).toHaveBeenCalledWith('[INFO]', 'Message', 'arg1', 'arg2', { data: 'test' })
    })

    it('debería manejar argumentos undefined', () => {
      logger.info('Message', undefined, null, { data: 'test' })
      expect(console.log).toHaveBeenCalledWith('[INFO]', 'Message', undefined, null, { data: 'test' })
    })
  })
})
