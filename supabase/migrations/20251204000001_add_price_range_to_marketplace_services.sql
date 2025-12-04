-- Agregar campos de rango de precios a marketplace_services
-- Migración creada: 2024-12-04

-- Agregar columnas price_min y price_max
ALTER TABLE marketplace_services 
ADD COLUMN IF NOT EXISTS price_min DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_max DECIMAL(10, 2);

-- Migrar datos existentes: copiar price a price_min y price_max
UPDATE marketplace_services 
SET 
  price_min = COALESCE(price_min, price),
  price_max = COALESCE(price_max, price)
WHERE 
  price IS NOT NULL 
  AND (price_min IS NULL OR price_max IS NULL);

-- Asegurar que no haya valores NULL
UPDATE marketplace_services 
SET 
  price_min = COALESCE(price_min, 0),
  price_max = COALESCE(price_max, 0)
WHERE 
  price_min IS NULL OR price_max IS NULL;

-- Hacer price_min y price_max NOT NULL ahora que tienen datos
ALTER TABLE marketplace_services 
ALTER COLUMN price_min SET NOT NULL,
ALTER COLUMN price_max SET NOT NULL;

-- Agregar constraint para asegurar que price_min <= price_max
-- Primero eliminar el constraint si existe, luego crearlo
DO $$ 
BEGIN
  ALTER TABLE marketplace_services DROP CONSTRAINT IF EXISTS check_price_range;
  ALTER TABLE marketplace_services ADD CONSTRAINT check_price_range CHECK (price_min <= price_max);
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Crear índice para búsquedas por rango de precio
CREATE INDEX IF NOT EXISTS idx_marketplace_services_price_range 
ON marketplace_services (price_min, price_max);

-- Comentarios para documentación
COMMENT ON COLUMN marketplace_services.price_min IS 'Precio mínimo del servicio en la moneda especificada';
COMMENT ON COLUMN marketplace_services.price_max IS 'Precio máximo del servicio en la moneda especificada';
COMMENT ON COLUMN marketplace_services.price IS 'OBSOLETO: Usar price_min y price_max en su lugar. Mantenido por compatibilidad';

