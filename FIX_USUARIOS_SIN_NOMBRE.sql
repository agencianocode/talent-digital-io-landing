-- ========================================
-- CORRECCIÓN: Actualizar perfiles sin nombre
-- ========================================
-- Este script actualiza los perfiles que no tienen full_name,
-- extrayendo el nombre del email de manera inteligente

-- Función helper para extraer nombre del email
CREATE OR REPLACE FUNCTION extract_name_from_email(email_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  local_part TEXT;
  name_parts TEXT[];
  result TEXT;
BEGIN
  -- Extraer la parte local del email (antes del @)
  local_part := SPLIT_PART(email_text, '@', 1);
  
  -- Si está vacío, retornar null
  IF local_part IS NULL OR local_part = '' THEN
    RETURN NULL;
  END IF;
  
  -- Si tiene números al final (como juan20guerre), intentar separar
  -- Si tiene puntos, guiones bajos o guiones, separar por esos
  IF local_part ~ '[._-]' THEN
    -- Separar por puntos, guiones bajos o guiones
    name_parts := string_to_array(
      regexp_replace(local_part, '[._-]', ' ', 'g'),
      ' '
    );
    
    -- Capitalizar cada parte
    result := '';
    FOR i IN 1..array_length(name_parts, 1) LOOP
      IF name_parts[i] IS NOT NULL AND name_parts[i] != '' THEN
        IF result != '' THEN
          result := result || ' ';
        END IF;
        result := result || INITCAP(name_parts[i]);
      END IF;
    END LOOP;
    
    RETURN result;
  ELSE
    -- Si no tiene separadores, capitalizar la primera letra
    RETURN INITCAP(local_part);
  END IF;
END;
$$;

-- Actualizar perfiles que no tienen nombre o tienen 'Sin nombre'
UPDATE profiles p
SET full_name = extract_name_from_email(au.email)
FROM auth.users au
WHERE p.user_id = au.id
  AND (
    p.full_name IS NULL 
    OR p.full_name = '' 
    OR p.full_name = 'Sin nombre'
  )
  AND au.email IS NOT NULL
  AND au.email != '';

-- Verificar actualización
SELECT 
  au.email,
  p.full_name as nombre_antes,
  extract_name_from_email(au.email) as nombre_desde_email,
  CASE 
    WHEN p.full_name IS NULL OR p.full_name = '' OR p.full_name = 'Sin nombre' 
    THEN 'Necesita actualización'
    ELSE 'OK'
  END as estado
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
WHERE au.email IN (
  'pablocorellam07@gmail.com',
  'sfq_80@hotmail.com',
  'juan20guerre@gmail.com',
  'bernaligf@gmail.com',
  'hernandezmorathay@gmail.com'
)
ORDER BY au.email;

-- Mostrar usuarios actualizados
SELECT 
  COUNT(*) as usuarios_actualizados,
  '✅ Perfiles actualizados' as resultado
FROM profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE p.full_name IS NOT NULL 
  AND p.full_name != '' 
  AND p.full_name != 'Sin nombre'
  AND p.full_name = extract_name_from_email(au.email);

-- Limpiar función temporal (opcional, puedes dejarla si quieres usarla después)
-- DROP FUNCTION IF EXISTS extract_name_from_email(TEXT);

SELECT '✅ Script completado' as resultado;

