-- Agregar campo first_response_at a la tabla applications
-- Este campo se actualizará automáticamente cuando el estado cambie de 'pending' a cualquier otro estado

-- Agregar la columna
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE;

-- Crear función para actualizar first_response_at automáticamente
CREATE OR REPLACE FUNCTION update_first_response_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el estado anterior era 'pending' y el nuevo estado NO es 'pending',
  -- y first_response_at aún no está establecido, establecerlo ahora
  IF (OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.first_response_at IS NULL) THEN
    NEW.first_response_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar first_response_at automáticamente
DROP TRIGGER IF EXISTS trigger_update_first_response_at ON applications;
CREATE TRIGGER trigger_update_first_response_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status != 'pending')
  EXECUTE FUNCTION update_first_response_at();

-- Comentario explicativo
COMMENT ON COLUMN applications.first_response_at IS 
'Timestamp de la primera respuesta de la empresa a esta aplicación. Se actualiza automáticamente cuando el estado cambia de pending a cualquier otro estado.';

