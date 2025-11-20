# 📦 Instalar Supabase CLI

## Opción 1: Usando npm (Recomendado)

```bash
npm install -g supabase
```

## Opción 2: Usando Scoop (Windows)

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Opción 3: Descargar binario directo

1. Ve a: https://github.com/supabase/cli/releases
2. Descarga la versión para Windows
3. Extrae el ejecutable
4. Agrega la carpeta al PATH de Windows

## Verificar instalación

```bash
supabase --version
```

## Iniciar sesión

```bash
supabase login
```

## Vincular proyecto

```bash
supabase link --project-ref TU_PROJECT_REF
```

---

## Alternativa: Desplegar desde el Dashboard Web

Si no puedes instalar el CLI, puedes desplegar las funciones manualmente desde el dashboard:

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a: Edge Functions
4. Para cada función:
   - Haz clic en la función
   - Haz clic en "Deploy"
   - O usa "Upload" para subir el código


