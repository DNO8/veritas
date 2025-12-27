# xBull Wallet Troubleshooting Guide

## Problema: xBull no se detecta en Brave

### Verificaciones Básicas

#### 1. **Confirmar Instalación**
- Ve a `brave://extensions/`
- Busca "xBull Wallet"
- Verifica que esté **habilitado** (toggle en azul)
- Verifica que tenga permisos para acceder a sitios web

#### 2. **Versión de xBull**
- xBull debe ser versión 5.0.0 o superior
- Actualiza desde Chrome Web Store si es necesario
- Link: https://chrome.google.com/webstore/detail/xbull-wallet/omajpeaffjgmlpmhbfdjepdejoemifpe

#### 3. **Configuración de Brave**
Brave tiene configuraciones de privacidad que pueden bloquear extensiones:

```
brave://settings/shields
```

- **Shields**: Desactiva shields para localhost durante desarrollo
- **Fingerprinting**: Configura en "Standard" (no "Strict")
- **Cookies**: Permite cookies de terceros para localhost

#### 4. **Inicializar xBull**
Antes de conectar desde la app:

1. Abre la extensión de xBull manualmente (click en el ícono)
2. Asegúrate de que esté desbloqueada (ingresa PIN/password)
3. Verifica que esté en **TESTNET**:
   - Settings → Network → Testnet
4. Luego intenta conectar desde la app

### Detección Técnica

La app detecta xBull usando 3 métodos:

```typescript
// Método 1: window.xBullSDK
if (window.xBullSDK) { ... }

// Método 2: window.xBullWalletConnect
if (window.xBullWalletConnect) { ... }

// Método 3: Stellar Wallets Kit
const wallets = await kit.getSupportedWallets();
```

### Debugging en Consola

Abre DevTools (F12) y ejecuta:

```javascript
// Verificar objetos de xBull
console.log('xBullSDK:', window.xBullSDK);
console.log('xBullWalletConnect:', window.xBullWalletConnect);

// Ver todos los objetos relacionados con wallets
Object.keys(window).filter(k => 
  k.toLowerCase().includes('xbull') || 
  k.toLowerCase().includes('stellar')
);
```

### Soluciones Comunes

#### Problema: Extension instalada pero no detectada

**Solución 1: Recargar la extensión**
```
1. brave://extensions/
2. Click en "Reload" en la tarjeta de xBull
3. Refresca la página de la app
```

**Solución 2: Reinstalar extensión**
```
1. Desinstala xBull completamente
2. Cierra y reabre Brave
3. Reinstala desde Chrome Web Store
4. Configura wallet y red testnet
```

**Solución 3: Limpiar caché**
```
1. brave://settings/clearBrowserData
2. Selecciona "Cached images and files"
3. Time range: "All time"
4. Clear data
5. Reinicia Brave
```

#### Problema: xBull se detecta pero no conecta

**Verificar red:**
- xBull debe estar en **TESTNET**
- La app está configurada para TESTNET
- No mezclar mainnet/testnet

**Verificar permisos:**
```
1. Abre xBull
2. Settings → Connected Sites
3. Verifica que localhost esté permitido
4. Si no, elimina y reconecta
```

#### Problema: "User closed modal" error

Esto significa que:
- El usuario canceló la conexión
- O el modal de xBull no se abrió correctamente

**Solución:**
```
1. Asegúrate de que no haya popups bloqueados
2. Verifica que xBull esté desbloqueado
3. Intenta conectar de nuevo
```

### Comparación con Freighter

| Aspecto | Freighter | xBull |
|---------|-----------|-------|
| Detección | `window.freighter` | `window.xBullSDK` o `xBullWalletConnect` |
| Inicialización | Inmediata | Puede requerir modal |
| Compatibilidad Brave | Excelente | Buena (requiere config) |
| Testnet | Fácil | Requiere configuración manual |

### Usar Stellar Wallets Kit (Recomendado)

Si xBull no se detecta directamente, la app usa `@creit.tech/stellar-wallets-kit`:

```typescript
import { StellarWalletsKit, XBULL_ID } from '@creit.tech/stellar-wallets-kit';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: XBULL_ID,
  modules: allowAllModules(),
});

// Esto abre un modal con todas las wallets disponibles
await kit.openModal();
```

### Logs de Debugging

La app ahora incluye logs en consola:

```
✓ xBull detected via window.xBullSDK
✓ xBull detected via Stellar Wallets Kit
✗ Error detecting xBull wallet: [error details]
```

Revisa estos logs en DevTools para diagnosticar.

### Alternativas

Si xBull sigue sin funcionar:

1. **Usa Freighter** (más estable en Brave)
   - https://freighter.app/

2. **Usa Albedo** (web-based, no requiere extensión)
   - Se abre automáticamente en nueva pestaña

3. **Prueba en Chrome** (xBull funciona mejor en Chrome)

### Reportar Issues

Si ninguna solución funciona:

1. Captura screenshot de `brave://extensions/`
2. Captura logs de consola (F12)
3. Ejecuta el debugger de wallets en la app
4. Reporta en GitHub con:
   - Versión de Brave
   - Versión de xBull
   - Screenshots
   - Logs de consola

### Configuración Recomendada para Desarrollo

```javascript
// .env.local
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET

// xBull Settings
Network: Testnet
Connected Sites: localhost:3000 ✓
Auto-approve: Off (for security)
```

### Checklist Final

- [ ] xBull instalado y habilitado en Brave
- [ ] xBull configurado en TESTNET
- [ ] xBull desbloqueado (PIN ingresado)
- [ ] Shields de Brave desactivados para localhost
- [ ] Página refrescada después de instalar
- [ ] DevTools abierto para ver logs
- [ ] Debugger de wallets muestra xBull detectado

Si todos los checks pasan y aún no funciona, usa Freighter o Albedo como alternativa.
