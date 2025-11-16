-- Script para actualizar las categorías viejas de los servicios del marketplace
-- a las nuevas categorías de opportunity_categories

-- IMPORTANTE: En marketplace_services.category se almacena el NOMBRE de la categoría (texto),
-- no el UUID del id. Por lo tanto, debemos buscar por 'name' en opportunity_categories.

-- Mapeo de categorías viejas a nuevas (por nombre):
-- diseno-grafico → Creativo
-- desarrollo-web → Tecnología y Automatizaciones
-- marketing-digital → Marketing
-- consultoria → Soporte Profesional
-- redaccion → Creativo
-- traduccion → Soporte Profesional (si existe) o Creativo (fallback)
-- video-edicion → Creativo
-- otros → Soporte Profesional (si existe) o Ventas (fallback)

DO $$
DECLARE
  category_creativo_name TEXT;
  category_tecnologia_name TEXT;
  category_marketing_name TEXT;
  category_soporte_name TEXT;
  category_ventas_name TEXT;
  default_category_name TEXT;
  updated_count INTEGER;
BEGIN
  -- Obtener los nombres de las categorías
  SELECT name INTO category_creativo_name FROM opportunity_categories WHERE LOWER(name) = 'creativo' OR name ILIKE '%creativo%' LIMIT 1;
  SELECT name INTO category_tecnologia_name FROM opportunity_categories WHERE LOWER(name) = 'tecnología y automatizaciones' OR name ILIKE '%tecnología%' OR name ILIKE '%tecnologia%' LIMIT 1;
  SELECT name INTO category_marketing_name FROM opportunity_categories WHERE LOWER(name) = 'marketing' OR name ILIKE '%marketing%' LIMIT 1;
  SELECT name INTO category_soporte_name FROM opportunity_categories WHERE LOWER(name) = 'soporte profesional' OR name ILIKE '%soporte%' LIMIT 1;
  SELECT name INTO category_ventas_name FROM opportunity_categories WHERE LOWER(name) = 'ventas' OR name ILIKE '%ventas%' LIMIT 1;

  -- Actualizar diseno-grafico → Creativo
  IF category_creativo_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_creativo_name,
        updated_at = NOW()
    WHERE category = 'diseno-grafico'
       OR category = 'diseño-gráfico'
       OR category ILIKE 'diseno%grafico%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría diseno-grafico → %', updated_count, category_creativo_name;
  END IF;

  -- Actualizar desarrollo-web → Tecnología y Automatizaciones
  IF category_tecnologia_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_tecnologia_name,
        updated_at = NOW()
    WHERE category = 'desarrollo-web'
       OR category ILIKE 'desarrollo%web%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría desarrollo-web → %', updated_count, category_tecnologia_name;
  END IF;

  -- Actualizar marketing-digital → Marketing
  IF category_marketing_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_marketing_name,
        updated_at = NOW()
    WHERE category = 'marketing-digital'
       OR category ILIKE 'marketing%digital%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría marketing-digital → %', updated_count, category_marketing_name;
  END IF;

  -- Actualizar consultoria → Soporte Profesional
  IF category_soporte_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_soporte_name,
        updated_at = NOW()
    WHERE category = 'consultoria'
       OR category = 'consultoría'
       OR category ILIKE 'consultoria%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría consultoria → %', updated_count, category_soporte_name;
  END IF;

  -- Actualizar redaccion → Creativo
  IF category_creativo_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_creativo_name,
        updated_at = NOW()
    WHERE category = 'redaccion'
       OR category = 'redacción'
       OR category ILIKE 'redaccion%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría redaccion → %', updated_count, category_creativo_name;
  END IF;

  -- Actualizar traduccion → Soporte Profesional (o Creativo como fallback)
  IF category_soporte_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_soporte_name,
        updated_at = NOW()
    WHERE category = 'traduccion'
       OR category = 'traducción'
       OR category ILIKE 'traduccion%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría traduccion → %', updated_count, category_soporte_name;
  ELSIF category_creativo_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_creativo_name,
        updated_at = NOW()
    WHERE category = 'traduccion'
       OR category = 'traducción'
       OR category ILIKE 'traduccion%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría traduccion → % (fallback)', updated_count, category_creativo_name;
  END IF;

  -- Actualizar video-edicion → Creativo
  IF category_creativo_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_creativo_name,
        updated_at = NOW()
    WHERE category = 'video-edicion'
       OR category = 'video-edición'
       OR category ILIKE 'video%edicion%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría video-edicion → %', updated_count, category_creativo_name;
  END IF;

  -- Actualizar otros → Soporte Profesional (o Ventas como fallback)
  IF category_soporte_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_soporte_name,
        updated_at = NOW()
    WHERE category = 'otros'
       OR category = 'otro';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría otros → %', updated_count, category_soporte_name;
  ELSIF category_ventas_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = category_ventas_name,
        updated_at = NOW()
    WHERE category = 'otros'
       OR category = 'otro';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Actualizados % servicios con categoría otros → % (fallback)', updated_count, category_ventas_name;
  END IF;

  -- Verificar servicios con categorías que no existen en opportunity_categories
  -- y asignarles una categoría por defecto (la primera disponible por nombre)
  SELECT name INTO default_category_name 
  FROM opportunity_categories 
  WHERE is_active = TRUE OR is_active IS NULL
  ORDER BY name 
  LIMIT 1;

  IF default_category_name IS NOT NULL THEN
    UPDATE marketplace_services
    SET category = default_category_name,
        updated_at = NOW()
    WHERE category NOT IN (SELECT name FROM opportunity_categories);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
      RAISE NOTICE 'Actualizados % servicios con categorías inválidas → %', updated_count, default_category_name;
    END IF;
  END IF;

END $$;

-- Mostrar resumen de actualizaciones
SELECT 
  category,
  COUNT(*) as servicios_count
FROM marketplace_services
GROUP BY category
ORDER BY servicios_count DESC;

-- Verificar si quedan categorías inválidas
SELECT DISTINCT category
FROM marketplace_services
WHERE category NOT IN (SELECT name FROM opportunity_categories);

