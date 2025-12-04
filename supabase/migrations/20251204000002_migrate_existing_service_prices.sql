-- Migrar precios existentes en marketplace_services
-- Este script actualiza todos los servicios que tienen price pero no tienen price_min/price_max
-- Ejecutar DESPUÉS de 20251204000001_add_price_range_to_marketplace_services.sql

-- Actualizar servicios existentes: copiar price a price_min y price_max
-- Solo para registros donde price_min o price_max sean NULL
UPDATE marketplace_services 
SET 
  price_min = COALESCE(price_min, price),
  price_max = COALESCE(price_max, price)
WHERE 
  price_min IS NULL 
  OR price_max IS NULL 
  OR price_min = 0 
  OR price_max = 0;

-- Verificar que no haya registros con valores NULL o 0
-- Esto asegura la integridad de los datos
UPDATE marketplace_services 
SET 
  price_min = price,
  price_max = price
WHERE 
  (price_min IS NULL OR price_min = 0)
  AND price IS NOT NULL 
  AND price > 0;

-- Log de registros actualizados
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM marketplace_services
  WHERE price_min IS NOT NULL AND price_max IS NOT NULL;
  
  RAISE NOTICE 'Total de servicios con precios migrados: %', updated_count;
END $$;

