-- Agregar company_id a marketplace_services para servicios publicados a nombre de empresa
-- Migración creada: 2024-12-04

-- Agregar columna company_id (nullable - algunos servicios son a nombre personal)
ALTER TABLE marketplace_services 
ADD COLUMN IF NOT EXISTS company_id UUID;

-- Agregar foreign key constraint
ALTER TABLE marketplace_services
ADD CONSTRAINT marketplace_services_company_id_fkey 
FOREIGN KEY (company_id) 
REFERENCES companies(id) 
ON DELETE CASCADE;

-- Crear índice para búsquedas por empresa
CREATE INDEX IF NOT EXISTS idx_marketplace_services_company_id 
ON marketplace_services (company_id);

-- Comentario para documentación
COMMENT ON COLUMN marketplace_services.company_id IS 'ID de la empresa si el servicio se publica a nombre de la empresa. NULL si es a nombre personal.';

-- Verificación
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'marketplace_services' 
    AND column_name = 'company_id'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'Columna company_id agregada exitosamente a marketplace_services';
  ELSE
    RAISE EXCEPTION 'Error: No se pudo agregar la columna company_id';
  END IF;
END $$;

