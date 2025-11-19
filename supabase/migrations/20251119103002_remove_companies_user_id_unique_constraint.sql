-- Eliminar la restricción única en user_id de la tabla companies
-- Esto permite que un usuario pueda crear múltiples empresas
-- El ownership se maneja a través de company_user_roles

-- Verificar si la restricción existe antes de eliminarla
DO $$
BEGIN
    -- Intentar eliminar la restricción única si existe
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'companies_user_id_key'
    ) THEN
        ALTER TABLE companies DROP CONSTRAINT companies_user_id_key;
        RAISE NOTICE 'Restricción única companies_user_id_key eliminada exitosamente';
    ELSE
        RAISE NOTICE 'La restricción companies_user_id_key no existe, no se requiere acción';
    END IF;
END $$;

-- Nota: user_id sigue siendo requerido (NOT NULL) pero ya no es único
-- Esto permite que múltiples empresas tengan el mismo user_id como referencia
-- El ownership real se maneja a través de company_user_roles

