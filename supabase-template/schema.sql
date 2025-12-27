ENUMS (tipos controlados)
-- Rol del usuario
CREATE TYPE user_role AS ENUM (
  'person',
  'startup',
  'project',
  'pyme'
);

-- Estado del proyecto
CREATE TYPE project_status AS ENUM (
  'draft',
  'published',
  'paused'
);

-- Tipo de media del proyecto
CREATE TYPE media_type AS ENUM (
  'image',
  'video'
);

2️⃣ Tabla users

Extiende auth.users (NO reemplaza)

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role user_role NOT NULL,
  wallet_address TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


✔ Wallet nullable
✔ Escalable
✔ Compatible Web2 → Web3

3️⃣ Tabla projects

Núcleo del sistema

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,

  category TEXT,
  
  cover_image_url TEXT NOT NULL,
  generated_cover BOOLEAN DEFAULT false,

  goal_amount NUMERIC,
  current_amount NUMERIC DEFAULT 0,

  wallet_address TEXT NULL,

  status project_status DEFAULT 'draft',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


📌 Importante

cover_image_url es OBLIGATORIO

Si no la sube → se genera por IA

generated_cover deja trazabilidad

4️⃣ Galería del proyecto (project_media)

Da credibilidad visual y storytelling

CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  type media_type NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


✔ Múltiples imágenes
✔ Videos pitch
✔ Orden controlado

5️⃣ Roadmap del proyecto
CREATE TABLE project_roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  estimated_cost NUMERIC,
  order_index INTEGER NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


Esto te permite:

Mostrar progreso

Justificar inversión

Escalar a milestones financiables

6️⃣ Uso de fondos (fund_usage)

Transparencia total

CREATE TABLE fund_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  label TEXT NOT NULL,
  percentage INTEGER CHECK (percentage >= 0 AND percentage <= 100),
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


📌 Puedes validar en frontend que el total sea 100%

7️⃣ Donaciones (donations)
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  donor_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  asset TEXT NOT NULL, -- XLM / USDC
  tx_hash TEXT NOT NULL,
  network TEXT NOT NULL, -- testnet / mainnet

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


✔ Auditable
✔ Transparente
✔ No custodial

8️⃣ Índices recomendados (performance feed)
CREATE INDEX idx_projects_status_created
ON projects (status, created_at DESC);

CREATE INDEX idx_donations_project
ON donations (project_id);

CREATE INDEX idx_project_media_project
ON project_media (project_id);