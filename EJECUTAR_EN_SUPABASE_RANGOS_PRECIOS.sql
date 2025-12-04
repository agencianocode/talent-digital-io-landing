-- =====================================================
-- MIGRACIÓN: Agregar rangos de precios a marketplace_services
-- IMPORTANTE: Ejecutar este script completo en Supabase SQL Editor
-- =====================================================

-- PASO 1: Agregar columnas price_min y price_max
ALTER TABLE marketplace_services 
ADD COLUMN IF NOT EXISTS price_min DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_max DECIMAL(10, 2);

-- PASO 2: Migrar datos existentes - copiar price a price_min y price_max
-- Usar COALESCE para manejar valores NULL
UPDATE marketplace_services 
SET 
  price_min = COALESCE(price_min, price),
  price_max = COALESCE(price_max, price)
WHERE 
  price IS NOT NULL 
  AND (price_min IS NULL OR price_max IS NULL);

-- PASO 3: Asegurar que no haya valores NULL en registros con precio
UPDATE marketplace_services 
SET 
  price_min = COALESCE(price_min, 0),
  price_max = COALESCE(price_max, 0)
WHERE 
  price_min IS NULL OR price_max IS NULL;

-- PASO 4: Hacer price_min y price_max NOT NULL ahora que tienen datos
ALTER TABLE marketplace_services 
ALTER COLUMN price_min SET NOT NULL,
ALTER COLUMN price_max SET NOT NULL;

-- PASO 5: Agregar constraint para asegurar que price_min <= price_max
DO $$ 
BEGIN
  ALTER TABLE marketplace_services DROP CONSTRAINT IF EXISTS check_price_range;
  ALTER TABLE marketplace_services ADD CONSTRAINT check_price_range CHECK (price_min <= price_max);
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- PASO 6: Crear índice para búsquedas por rango de precio
CREATE INDEX IF NOT EXISTS idx_marketplace_services_price_range 
ON marketplace_services (price_min, price_max);

-- PASO 7: Agregar comentarios para documentación
COMMENT ON COLUMN marketplace_services.price_min IS 'Precio mínimo del servicio en la moneda especificada';
COMMENT ON COLUMN marketplace_services.price_max IS 'Precio máximo del servicio en la moneda especificada';
COMMENT ON COLUMN marketplace_services.price IS 'OBSOLETO: Usar price_min y price_max en su lugar. Mantenido por compatibilidad';

-- VERIFICACIÓN: Mostrar estadísticas de la migración
DO $$
DECLARE
  total_servicios INTEGER;
  servicios_con_rango INTEGER;
  servicios_precio_cero INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_servicios FROM marketplace_services;
  
  SELECT COUNT(*) INTO servicios_con_rango 
  FROM marketplace_services 
  WHERE price_min IS NOT NULL AND price_max IS NOT NULL;
  
  SELECT COUNT(*) INTO servicios_precio_cero 
  FROM marketplace_services 
  WHERE price_min = 0 OR price_max = 0;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRACIÓN COMPLETADA';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total de servicios: %', total_servicios;
  RAISE NOTICE 'Servicios con rango de precio: %', servicios_con_rango;
  RAISE NOTICE 'Servicios con precio en 0: %', servicios_precio_cero;
  RAISE NOTICE '==============================================';
END $$;

-- Mostrar algunos ejemplos de los datos migrados
SELECT 
  id,
  title,
  price as precio_antiguo,
  price_min,
  price_max,
  currency
FROM marketplace_services
LIMIT 5;

