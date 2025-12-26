## Project Name

VERITAS (nombre provisional)

## Objective

Construir un MVP completamente funcional de una plataforma de donaciones tipo Buy Me a Coffee orientada a proyectos, startups, pymes y personas, construida sobre Stellar, priorizando backend, lógica de negocio y estabilidad, con el mínimo frontend necesario solo para probar flujos.

## Core Principles (NO negociar)

Backend First

Prioridad absoluta a:

Modelos de datos

Integración con Supabase

Lógica de donaciones

Integración con Stellar

El frontend debe ser mínimo, funcional y sin diseño complejo.

NO inventar campos

Solo se pueden usar las tablas, columnas, enums y relaciones exactamente definidas en el schema SQL entregado.

Si un campo no existe → NO se usa.

Si falta algo → se documenta como TODO, no se inventa.

Web2 + Web3 compatible

Usuarios pueden no tener wallet.

wallet_address es nullable.

El sistema debe funcionar incluso si el usuario nunca conecta una wallet.

## Tech Stack (justificado)
 ## Frontend

Next.js (App Router)

TypeScript

UI mínima (HTML + CSS básico)

Sin animaciones complejas

Sin optimización visual avanzada

 ## Backend

Supabase

Auth

PostgreSQL

Storage

SQL puro para queries complejas

RLS cuando sea estrictamente necesario

## Blockchain

 # Stellar

SDK oficial de Stellar

Uso de:

XLM

USDC sobre Stellar

Soporte para:

Testnet

Mainnet

## Blockchain Justification (Stellar)

Stellar se usa NO solo por fees bajos, sino por:

Pagos rápidos (finalidad casi inmediata)

Ideal para microdonaciones

Soporte nativo de USDC

Excelente UX para onboarding Web2 → Web3

Infraestructura madura para pagos

Buen fit para LATAM

## What Stellar is used for

Recepción directa de donaciones

Pagos peer-to-peer

No custodial

Sin contratos complejos para el MVP

## Wallet Strategy

NO crear wallets automáticamente

NO custodial

El usuario:

Puede conectar wallet con Freighter

Puede recibir donaciones sin haber conectado wallet (campo nulo)

Donaciones:

Se envían directamente a la wallet del proyecto

La app solo registra la transacción

## Database (STRICT)
## Enums existentes

user_role

project_status

media_type

## Tables existentes (NO modificar sin permiso)

users

projects

project_media

project_roadmap_items

fund_usage

donations

👉 Usar exactamente estos nombres y campos

## Data Flow (obligatorio)
## User

Se registra (email + auth)

Se crea registro en users

wallet_address puede ser NULL

## Project

Usuario crea proyecto

Debe existir:

title

short_description

cover_image_url

Si no sube cover → se genera vía IA (Nanobanana)

Proyecto inicia en draft

Al publicar → published

## Donations

Usuario dona desde su wallet

Se ejecuta tx en Stellar

Se guarda:

tx_hash

amount

asset

network

Se actualiza projects.current_amount

## API / Services Rules 

Todas las funciones:

Deben ser puras

Deben validar inputs

Deben manejar errores explícitos

Nunca asumir que:

El usuario tiene wallet

El proyecto está publicado

La red es mainnet

## Stellar Integration Rules    

Usar SDK oficial

Validar:

Formato de wallet

Existencia de la cuenta

Confirmación de la transacción

Nunca asumir éxito sin confirmación on-chain

Registrar siempre:

Hash

Asset

Network

## Frontend Scope (MINIMAL)

✔ Formularios simples
✔ Listado básico tipo feed
✔ Página de proyecto
✔ Botón de donar

❌ No diseño avanzado
❌ No animaciones
❌ No optimizaciones visuales

## Non-Goals (NO hacer)

❌ Custodia de fondos

❌ Stripe / Flow (solo roadmap)

❌ Smart contracts complejos

❌ KYC

❌ Pagos fiat en MVP

## Roadmap Awareness (solo referencia)

Futuro:

On-ramp fiat

Stripe / Flow

Smart contracts Soroban

Milestones financiables

Reputación de proyectos

⚠️ NO implementar ahora

## Deliverables

Backend funcional al 100%

Supabase completamente integrado

Donaciones reales en Stellar testnet

Repositorio público

Deploy funcional

Código documentado

## Final Instruction to Agent

Prioriza estabilidad, claridad y corrección técnica por sobre estética.
Si dudas entre frontend o backend → elige backend.
Si algo no existe en el schema → NO lo inventes.

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


Esto es clave para:

Feed infinito

Cargas rápidas

Escalar sin dolor

9️⃣ Flujo lógico soportado (resumen)

Usuario se registra (sin wallet)

Crea proyecto

Sube cover o se genera por IA

Añade galería

Completa roadmap y uso de fondos

Publica proyecto

Conecta wallet

Recibe donaciones

Todo sin romper el modelo.

🔟 Por qué este esquema es sólido

✔ Web2 + Web3
✔ UX first
✔ Transparente
✔ Escalable
✔ Ideal para un MVP + Hackathon
✔ Defendible frente a jurado técnico