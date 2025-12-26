# 🔐 Configuración OAuth Google - Producción y Desarrollo

## ✅ Cambios Realizados en el Código

### **1. Variables de Entorno**
Agregada nueva variable `NEXT_PUBLIC_SITE_URL` para manejar redirects de OAuth.

**Local (`.env`):**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Producción (Vercel):**
```env
NEXT_PUBLIC_SITE_URL=https://colmena-beta.vercel.app
```

### **2. Páginas Actualizadas**
- ✅ `src/app/[locale]/login/page.tsx` - Usa `NEXT_PUBLIC_SITE_URL` + locale
- ✅ `src/app/[locale]/signup/page.tsx` - Usa `NEXT_PUBLIC_SITE_URL` + locale
- ✅ `src/app/[locale]/auth/callback/page.tsx` - Redirects con locale prefix

---

## 🔧 Configuración en Supabase Dashboard

### **Paso 1: Agregar Redirect URLs**

1. Ve a tu **Supabase Dashboard**
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. En **Redirect URLs**, agrega:

```
http://localhost:3000/es/auth/callback
http://localhost:3000/en/auth/callback
https://colmena-beta.vercel.app/es/auth/callback
https://colmena-beta.vercel.app/en/auth/callback
```

5. Click en **Save**

### **Paso 2: Configurar Site URL**

En la misma sección **URL Configuration**:

**Site URL:**
```
https://colmena-beta.vercel.app
```

---

## 🔧 Configuración en Google Cloud Console

Ya tienes configurado `colmena-beta.vercel.app` en Google OAuth, pero asegúrate de tener:

### **Authorized JavaScript origins:**
```
http://localhost:3000
https://colmena-beta.vercel.app
```

### **Authorized redirect URIs:**
```
https://hfspqcujujuligtwuviz.supabase.co/auth/v1/callback
```

**Nota:** El redirect URI de Google apunta a Supabase, NO a tu app directamente. Supabase maneja el OAuth y luego redirige a tu app.

---

## 🚀 Configuración en Vercel

### **Variables de Entorno en Vercel:**

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega/actualiza:

```env
NEXT_PUBLIC_SITE_URL=https://colmena-beta.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://hfspqcujujuligtwuviz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fX-ZiN7gNy-oXZSNeYEulQ_51UL6e33
NEXT_SECRET_SUPABASE_KEY=sb_secret_qUN03ED443KDaOwK0C3WkA_0Mi9WNbU
NEXT_GEMINI_API_KEY=AIzaSyAqhE5QOBki0elWV-hoHc3QDZasuK1WVVk
```

4. Asegúrate de que estén disponibles para **Production**, **Preview**, y **Development**
5. Redeploy tu aplicación

---

## 🔍 Flujo de OAuth Actualizado

### **Desarrollo (localhost):**
```
1. Usuario click "Continue with Google"
   ↓
2. Redirect a Google OAuth
   ↓
3. Usuario autoriza
   ↓
4. Google → Supabase callback
   ↓
5. Supabase → http://localhost:3000/es/auth/callback
   ↓
6. Callback procesa tokens
   ↓
7. Redirect a /es/projects o /es/complete-profile
```

### **Producción (Vercel):**
```
1. Usuario click "Continue with Google"
   ↓
2. Redirect a Google OAuth
   ↓
3. Usuario autoriza
   ↓
4. Google → Supabase callback
   ↓
5. Supabase → https://colmena-beta.vercel.app/es/auth/callback
   ↓
6. Callback procesa tokens
   ↓
7. Redirect a /es/projects o /es/complete-profile
```

---

## ✅ Checklist de Configuración

### **Supabase:**
- [ ] Site URL configurada: `https://colmena-beta.vercel.app`
- [ ] Redirect URLs agregadas (localhost + producción)
- [ ] Google OAuth habilitado
- [ ] Client ID y Secret de Google configurados

### **Google Cloud Console:**
- [ ] Authorized origins incluyen localhost y producción
- [ ] Redirect URI apunta a Supabase callback
- [ ] OAuth consent screen configurado

### **Vercel:**
- [ ] `NEXT_PUBLIC_SITE_URL` configurada
- [ ] Todas las variables de entorno agregadas
- [ ] Deploy realizado después de agregar variables

### **Código:**
- [x] Login page usa `NEXT_PUBLIC_SITE_URL`
- [x] Signup page usa `NEXT_PUBLIC_SITE_URL`
- [x] Callback page maneja locale prefix
- [x] Todos los redirects incluyen locale

---

## 🧪 Probar OAuth

### **En Desarrollo:**
```bash
1. pnpm run dev
2. Ve a http://localhost:3000/es/login
3. Click "Continue with Google"
4. Autoriza con tu cuenta Google
5. Deberías ser redirigido a /es/projects
```

### **En Producción:**
```bash
1. Ve a https://colmena-beta.vercel.app/es/login
2. Click "Continue with Google"
3. Autoriza con tu cuenta Google
4. Deberías ser redirigido a /es/projects
```

---

## ⚠️ Problemas Comunes

### **"Redirect URI mismatch"**

**Causa:** La URL de callback no está autorizada en Google Cloud Console o Supabase.

**Solución:**
1. Verifica que en Supabase tengas:
   - `https://colmena-beta.vercel.app/es/auth/callback`
   - `https://colmena-beta.vercel.app/en/auth/callback`
2. En Google Cloud Console, verifica que tengas:
   - `https://hfspqcujujuligtwuviz.supabase.co/auth/v1/callback`

### **"Invalid redirect URL"**

**Causa:** `NEXT_PUBLIC_SITE_URL` no está configurada en Vercel.

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Agrega `NEXT_PUBLIC_SITE_URL=https://colmena-beta.vercel.app`
3. Redeploy

### **Redirect a localhost en producción**

**Causa:** Variable de entorno no actualizada en Vercel.

**Solución:**
1. Verifica que `NEXT_PUBLIC_SITE_URL` en Vercel sea la URL de producción
2. Redeploy después de cambiar

### **"Authentication failed"**

**Causa:** Tokens inválidos o sesión expirada.

**Solución:**
1. Limpia cookies del navegador
2. Intenta de nuevo
3. Verifica que las keys de Supabase sean correctas

---

## 📝 Notas Importantes

1. **Locale Awareness:** El sistema ahora preserva el idioma seleccionado durante todo el flujo de OAuth.

2. **Environment Variables:** `NEXT_PUBLIC_SITE_URL` debe ser diferente en desarrollo vs producción.

3. **Supabase Callback:** Google redirige a Supabase primero, luego Supabase redirige a tu app.

4. **Multiple Locales:** Debes agregar redirect URLs para cada locale que soportes (es, en).

5. **Vercel Deploys:** Cada vez que cambies variables de entorno, debes hacer redeploy.

---

## 🎯 URLs Finales Configuradas

### **Desarrollo:**
- Login: `http://localhost:3000/es/login`
- Callback: `http://localhost:3000/es/auth/callback`
- Success: `http://localhost:3000/es/projects`

### **Producción:**
- Login: `https://colmena-beta.vercel.app/es/login`
- Callback: `https://colmena-beta.vercel.app/es/auth/callback`
- Success: `https://colmena-beta.vercel.app/es/projects`

---

**Última actualización:** Diciembre 26, 2025  
**Estado:** ✅ Configurado para Producción y Desarrollo
