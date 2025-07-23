-- Update user role to business to allow company creation
UPDATE user_roles SET role = 'business' WHERE user_id = '67867ced-6ae0-43e1-8ce6-16cf832debf0';

-- Insert sample companies 
INSERT INTO companies (user_id, name, description, website, industry, size, location) VALUES 
('67867ced-6ae0-43e1-8ce6-16cf832debf0', 'TechStart Solutions', 'Startup especializada en soluciones digitales para empresas', 'https://techstart.com', 'Tecnología', '10-50', 'Ciudad de México');

-- Get the company ID for creating opportunities
DO $$
DECLARE
    company_uuid UUID;
BEGIN
    SELECT id INTO company_uuid FROM companies WHERE name = 'TechStart Solutions';
    
    -- Insert sample opportunities
    INSERT INTO opportunities (company_id, title, description, requirements, location, type, category, salary_min, salary_max, currency) VALUES 
    (company_uuid, 'Desarrollador Full Stack React/Node', 'Buscamos desarrollador con experiencia en React y Node.js para unirse a nuestro equipo', 'Experiencia mínima 2 años en React, Node.js, SQL, Git', 'Ciudad de México', 'full-time', 'Desarrollo', 40000, 60000, 'MXN'),
    (company_uuid, 'Especialista en Marketing Digital', 'Únete a nuestro equipo como especialista en marketing digital y SEO', 'Experiencia en Google Ads, Facebook Ads, SEO, Analytics', 'Remoto', 'full-time', 'Marketing', 35000, 50000, 'MXN'),
    (company_uuid, 'Diseñador UX/UI', 'Diseñador creativo para proyectos web y móviles', 'Portfolio sólido, Figma, Adobe XD, experiencia en diseño responsive', 'Híbrido', 'full-time', 'Diseño', 30000, 45000, 'MXN');
END $$;