# Configuración de Sesiones

## Tiempos de Expiración Implementados

### Cliente (Browser)
- **Access Token**: 1 hora (configurado en Supabase Dashboard)
- **Refresh Token**: 2 horas (configurado en Supabase Dashboard)
- **Auto-refresh**: Habilitado
- **Persist Session**: Habilitado

### Middleware
- **Cookie MaxAge**: 2 horas (7200 segundos)
- **HttpOnly**: true
- **Secure**: true (solo en producción)
- **SameSite**: lax

### Auto-logout por Inactividad
- **Timeout de Inactividad**: 2 horas
- **Verificación de Sesión**: Cada 5 minutos
- **Eventos Monitoreados**: mousedown, mousemove, keypress, scroll, touchstart, click

## Configuración en Supabase Dashboard

Para que la configuración funcione correctamente, debes configurar los siguientes valores en tu proyecto de Supabase:

1. Ve a **Authentication** → **Settings** → **Auth Settings**

2. Configura los siguientes valores:

   - **JWT Expiry**: `3600` (1 hora en segundos)
   - **Refresh Token Rotation**: Habilitado
   - **Refresh Token Reuse Interval**: `10` (segundos)
   - **Session Timeout**: `7200` (2 horas en segundos)

3. En **Security Settings**:
   - **Enable Secure Session Cookie**: Habilitado (producción)
   - **Enable Same Site Cookie**: `lax`

## Flujo de Sesión

1. Usuario inicia sesión → Recibe access token (1h) y refresh token (2h)
2. Cada 5 minutos se verifica la validez de la sesión
3. Si el token está por expirar (<5 min), se intenta refrescar automáticamente
4. Si hay 2 horas de inactividad, se cierra sesión automáticamente
5. Si el refresh token expira, se redirige a login

## Comportamiento Esperado

- **Sesión activa con uso**: Se mantiene hasta 2 horas desde el último login
- **Sesión inactiva**: Se cierra después de 2 horas sin interacción
- **Token expirado**: Se intenta refrescar automáticamente
- **Refresh fallido**: Logout automático y redirección a login

## Mensajes de Redirección

- `?reason=timeout`: Sesión cerrada por inactividad
- `?reason=expired`: Token expirado y no se pudo refrescar

## Archivos Modificados

1. `src/lib/supabase/client.ts` - Configuración del cliente browser
2. `src/middleware.ts` - Configuración de cookies con maxAge
3. `src/lib/hooks/useSessionTimeout.ts` - Hook de auto-logout
4. `src/components/SessionManager.tsx` - Componente de gestión de sesión
5. `src/app/[locale]/layout.tsx` - Integración del SessionManager

## Testing

Para probar la configuración:

1. Inicia sesión
2. Espera 2 horas sin interacción → Debe cerrar sesión
3. Interactúa con la app → El timeout se resetea
4. Verifica que las cookies expiran en 2 horas (DevTools → Application → Cookies)

## Notas de Seguridad

- Las cookies son HttpOnly para prevenir XSS
- Las cookies son Secure en producción para prevenir MITM
- SameSite=lax previene CSRF
- El refresh token rotation previene replay attacks
