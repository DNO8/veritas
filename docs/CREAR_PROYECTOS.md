# Guía para Crear Proyectos en Colmena

## Requisitos Previos

1. Tener una cuenta creada en la plataforma
2. Haber completado el perfil (nombre y rol)
3. Opcionalmente, conectar una wallet Stellar para recibir donaciones

---

## Crear un Proyecto desde la UI

1. Inicia sesión en tu cuenta
2. Ve a **"Crear Proyecto"** desde el navbar o la landing page
3. Completa el formulario:

### Campos Obligatorios

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Título** | Nombre del proyecto (máx 100 caracteres) | "Huerto Comunitario La Esperanza" |
| **Descripción corta** | Resumen breve (máx 200 caracteres) | "Agricultura urbana para familias vulnerables" |
| **Imagen de portada** | URL de imagen o subir archivo | https://images.unsplash.com/... |

### Campos Opcionales

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Descripción completa** | Detalle extenso del proyecto | Markdown soportado |
| **Categoría** | Clasificación del proyecto | `social`, `tech`, `education`, `environment`, `art`, `health` |
| **Meta de financiamiento** | Monto objetivo en USD | 5000 |
| **Wallet del proyecto** | Dirección Stellar para recibir fondos | G... |

---

## Crear Proyectos Directamente en Supabase

Si necesitas crear proyectos de prueba directamente en la base de datos:

### 1. Accede a Supabase Dashboard

- URL: https://supabase.com/dashboard
- Selecciona tu proyecto
- Ve a **Table Editor** → **projects**

### 2. Insertar un Proyecto

```sql
INSERT INTO projects (
  owner_id,
  title,
  short_description,
  full_description,
  category,
  cover_image_url,
  goal_amount,
  current_amount,
  wallet_address,
  status
) VALUES (
  'TU_USER_ID_AQUI',
  'Energía Solar para Escuelas Rurales',
  'Paneles solares para 5 escuelas sin electricidad',
  'Este proyecto busca llevar energía limpia y sostenible a comunidades rurales que actualmente no tienen acceso a electricidad...',
  'education',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
  5000,
  0,
  'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3YBMENK5ABCD',
  'published'
);
```

### 3. Categorías Válidas

```
social      - Proyectos sociales y comunitarios
tech        - Tecnología e innovación
education   - Educación y formación
environment - Medio ambiente y sostenibilidad
art         - Arte y cultura
health      - Salud y bienestar
```

### 4. Estados del Proyecto

```
draft     - Borrador (no visible públicamente)
published - Publicado (visible en la landing y listados)
paused    - Pausado (visible pero no acepta donaciones)
```

---

## Proyectos de Ejemplo para Testing

### Proyecto 1: Social
```sql
INSERT INTO projects (owner_id, title, short_description, category, cover_image_url, goal_amount, status)
VALUES (
  'TU_USER_ID',
  'Comedor Comunitario Sol Naciente',
  'Alimentación diaria para 100 familias en situación vulnerable',
  'social',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
  3000,
  'published'
);
```

### Proyecto 2: Tecnología
```sql
INSERT INTO projects (owner_id, title, short_description, category, cover_image_url, goal_amount, status)
VALUES (
  'TU_USER_ID',
  'Laboratorio de Robótica Escolar',
  'Kits de robótica para escuelas públicas de la región',
  'tech',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  4500,
  'published'
);
```

### Proyecto 3: Medio Ambiente
```sql
INSERT INTO projects (owner_id, title, short_description, category, cover_image_url, goal_amount, status)
VALUES (
  'TU_USER_ID',
  'Reforestación Cerro Verde',
  'Plantación de 1000 árboles nativos en zona deforestada',
  'environment',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
  2500,
  'published'
);
```

### Proyecto 4: Educación
```sql
INSERT INTO projects (owner_id, title, short_description, category, cover_image_url, goal_amount, status)
VALUES (
  'TU_USER_ID',
  'Biblioteca Digital Rural',
  'Tablets y contenido educativo para escuelas sin internet',
  'education',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  6000,
  'published'
);
```

### Proyecto 5: Arte
```sql
INSERT INTO projects (owner_id, title, short_description, category, cover_image_url, goal_amount, status)
VALUES (
  'TU_USER_ID',
  'Mural Colectivo Barrio Norte',
  'Arte urbano participativo con jóvenes de la comunidad',
  'art',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
  1500,
  'published'
);
```

### Proyecto 6: Salud
```sql
INSERT INTO projects (owner_id, title, short_description, category, cover_image_url, goal_amount, status)
VALUES (
  'TU_USER_ID',
  'Clínica Móvil Veterinaria',
  'Atención veterinaria gratuita para mascotas de familias de bajos recursos',
  'health',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
  3500,
  'published'
);
```

---

## Obtener tu User ID

Para obtener tu `owner_id`, ejecuta en Supabase SQL Editor:

```sql
SELECT id, email, name FROM users WHERE email = 'tu@email.com';
```

O desde el Table Editor, ve a la tabla `users` y copia el `id` de tu usuario.

---

## Notas Importantes

- **cover_image_url** es obligatorio. Si no tienes imagen, el sistema puede generar una con IA
- **wallet_address** es opcional pero necesario para recibir donaciones
- Los proyectos en `draft` no aparecen en la landing ni en el listado público
- **current_amount** se actualiza automáticamente cuando se registran donaciones
