# Configuración de Cron Job para Cierre Automático de Oportunidades

## Función: close-expired-opportunities

Esta función cierra automáticamente las oportunidades cuando su fecha límite (`deadline_date`) ha pasado.

### Comportamiento

1. **Busca oportunidades expiradas**: Encuentra todas las oportunidades con status 'active' cuya `deadline_date` sea anterior a la fecha actual.

2. **Cierra las oportunidades**: Actualiza el `status` a 'closed' y `is_active` a false.

3. **Notifica a los dueños**: Crea una notificación para el propietario de la empresa informándole que la oportunidad se cerró automáticamente.

4. **Permite reapertura**: Las oportunidades cerradas pueden reabrirse manualmente desde el dashboard, estableciendo una nueva fecha límite.

### Configuración del Cron Job

#### Usando cURL directo (recomendado para producción)

Configure un cron job en su servidor o servicio de cron jobs (como cron-job.org, EasyCron, etc.):

```bash
# Ejecutar diariamente a las 00:05 AM UTC
5 0 * * * curl -X POST \
  https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/close-expired-opportunities \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

#### Usando Supabase Edge Functions con pg_cron (alternativa)

Si tiene acceso a pg_cron en su instancia de Supabase:

```sql
-- Crear el cron job que se ejecuta diariamente a las 00:05 AM UTC
SELECT cron.schedule(
  'close-expired-opportunities',
  '5 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/close-expired-opportunities',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret')
    )
  );
  $$
);
```

### Seguridad

- ✅ La función requiere `CRON_SECRET` en el header de Authorization
- ✅ Solo procesa oportunidades con status 'active'
- ✅ Registra todas las operaciones en los logs
- ✅ Crea notificaciones para los propietarios

### Verificación

Para verificar que el cron job está funcionando:

1. Revise los logs de la función en Supabase Dashboard
2. Verifique que las oportunidades expiradas tengan status 'closed'
3. Confirme que los propietarios reciban notificaciones

### Prueba Manual

Para probar la función manualmente:

```bash
curl -X POST \
  https://wyrieetebfzmgffxecpz.supabase.co/functions/v1/close-expired-opportunities \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

### Reapertura de Oportunidades

Las empresas pueden reabrir oportunidades cerradas:

1. Acceder a la oportunidad desde su dashboard
2. Actualizar la fecha límite a una fecha futura
3. Cambiar el status de 'closed' a 'active'
4. La oportunidad volverá a aparecer en las búsquedas

### Notas Importantes

- **Horario**: Se recomienda ejecutar a las 00:05 AM UTC para procesar oportunidades del día anterior
- **Frecuencia**: Una vez al día es suficiente
- **Backup**: Las oportunidades cerradas se mantienen en la base de datos y pueden reabrirse
- **Notificaciones**: Los propietarios son notificados automáticamente cuando una oportunidad se cierra

### Monitoreo

Métricas que devuelve la función:
- `opportunitiesClosed`: Número de oportunidades cerradas
- `notificationsCreated`: Número de notificaciones enviadas
- `opportunitiesChecked`: Total de oportunidades revisadas
