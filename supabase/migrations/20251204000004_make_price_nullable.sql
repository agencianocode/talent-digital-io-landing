-- Hacer el campo "price" nullable ya que ahora usamos price_min y price_max
-- Migración creada: 2024-12-04

-- PASO 1: Hacer price nullable (ya no es requerido)
ALTER TABLE marketplace_services 
ALTER COLUMN price DROP NOT NULL;

-- PASO 2: Actualizar registros existentes donde price es 0 para usar el promedio de price_min y price_max
UPDATE marketplace_services 
SET price = (price_min + price_max) / 2
WHERE price = 0 AND price_min IS NOT NULL AND price_max IS NOT NULL;

-- PASO 3: Para registros futuros, actualizar price para que tenga un valor por defecto basado en price_min
-- Esto es opcional pero útil para mantener compatibilidad hacia atrás
UPDATE marketplace_services 
SET price = price_min
WHERE price IS NULL AND price_min IS NOT NULL;

-- Comentario actualizado
COMMENT ON COLUMN marketplace_services.price IS 'OBSOLETO: Campo legacy mantenido por compatibilidad. Usar price_min y price_max. Puede ser NULL.';

-- Verificación
DO $$
DECLARE
  total_servicios INTEGER;
  servicios_sin_price INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_servicios FROM marketplace_services;
  
  SELECT COUNT(*) INTO servicios_sin_price 
  FROM marketplace_services 
  WHERE price IS NULL;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRACIÓN COMPLETADA: price ahora es nullable';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total de servicios: %', total_servicios;
  RAISE NOTICE 'Servicios con price NULL: %', servicios_sin_price;
  RAISE NOTICE '==============================================';
END $$;

