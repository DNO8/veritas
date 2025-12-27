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

Puede conectar wallet con Freighter, xbull o albedo

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

## PROPUESTA DE VALOR BLOCKCHAIN
Descripción técnica de alto nivel

La plataforma implementa un sistema de crowdfunding basado en recompensas utilizando Stellar como capa de pagos y emisión de activos.

Los flujos principales son:

Recepción de fondos en USDC sobre Stellar

Custodia controlada por la plataforma (MVP)

Emisión de activos digitales únicos (1-of-1) que representan beneficios reales

Verificación on-chain de propiedad para canje de beneficios

No se implementan instrumentos financieros ni promesas de retorno económico.

2️⃣ Arquitectura general
Capas del sistema
Frontend (Next.js)
│
├── Auth & UX
├── Visualización de proyectos
├── Conexión con Freighter, xbull o albedo
│
Backend (Next.js API / Server Actions)
│
├── Supabase (Postgres + Storage)
├── Stellar SDK
├── Emisión de activos
│
Blockchain Layer (Stellar)
│
├── Cuentas emisoras (projects)
├── Activos únicos (benefits)
├── Pagos USDC

3️⃣ Modelo de activos (NFT-like)
Enfoque

En lugar de ERC-721, se utiliza el modelo nativo de Stellar:

Cada beneficio se representa como un asset con supply = 1

El issuer del asset es una cuenta controlada por el proyecto

El holder es la cuenta del donador

Esto garantiza:

Unicidad on-chain

Trazabilidad

Verificabilidad sin contratos

Estructura del asset
Campo	Uso
Asset Code	Identificador del beneficio
Issuer	Cuenta del proyecto
Supply	1
Holder	Donador
Metadata	Off-chain (DB / IPFS opcional)
4️⃣ Metadata y off-chain data

Dado que Stellar no impone un estándar NFT con metadata on-chain:

La metadata del beneficio se almacena off-chain:

Descripción

Tipo de beneficio

Fecha de expiración

Estado (activo / canjeado)

Se mantiene una relación fuerte entre:

asset_code

issuer_public_key

registro en la base de datos

Esto evita indexers externos y simplifica la arquitectura.

5️⃣ Flujo técnico de donación

Usuario conecta Freighter xbull o albedo

Realiza pago USDC a la cuenta del proyecto

Backend verifica la transacción vía Horizon

Backend:

Registra donación

Emite asset único

Transfiere asset al donador

Donador ve el beneficio en su wallet

6️⃣ Custodia y wallets
Donadores

Custodia no-custodial

Wallet: Freighter, xbull o albedo

Trustline requerida solo para el asset emitido

Proyectos

Cada proyecto tiene:

Una cuenta Stellar emisora

Claves gestionadas por la plataforma (MVP)

Roadmap:

Self-custody

Multi-sig

DAO-style control

7️⃣ Seguridad y control

Para el MVP:

Assets no financieros

Supply fijo

No mint adicional

Flags de control del issuer (opcional):

Authorization required

Freeze (si aplica)

No existe riesgo sistémico ni exposición financiera.

8️⃣ Por qué NO smart contracts en MVP
Justificación técnica

Stellar permite activos únicos sin Soroban

Reduce superficie de ataque

Reduce tiempo de desarrollo

Mejora confiabilidad

Soroban queda reservado para:

Time-locks

Burn on redeem

Milestones

Rewards programables

9️⃣ Escalabilidad

El modelo escala porque:

Stellar soporta alto throughput

Fees mínimos permiten micro-transacciones

DB off-chain maneja el estado complejo

Blockchain mantiene la fuente de verdad para propiedad

🔟 Comparación con Web2 (técnica)
Aspecto	Web2	Esta solución
Custodia	Centralizada	Non-custodial
Beneficios	Promesas	Activos on-chain
Verificación	Manual	Criptográfica
Global	Limitada	Nativa
Costos	Altos	Bajos
11️⃣ Riesgos conocidos y mitigaciones
Riesgo	Mitigación
UX crypto	Freighter, xbull o albedo + abstracción
Metadata inconsistente	FK estrictas DB
Keys del issuer	Roadmap multi-sig
NFT standards	Uso de assets nativos
12️⃣ Conclusión técnica

Este proyecto utiliza Stellar de forma pragmática, explotando sus fortalezas reales:

Pagos

Emisión de activos

Costos bajos

Simplicidad

No intenta forzar paradigmas EVM ni DeFi donde no aportan valor.

Frase técnica final (perfecta para cerrar):

The system leverages Stellar’s native asset model to represent real-world benefits as unique, verifiable digital assets, avoiding unnecessary smart contract complexity while preserving on-chain guarantees.

Si quieres, el siguiente paso lógico sería:

diagrama técnico

pseudocódigo de emisión

definición exacta de flags y cuentas Stellar

checklist de implementación

Tienes una arquitectura muy sólida. Aquí ya estás hablando como builder serio, no como pitch crypto 🚀

el supply no necesariamente debe ser 1, si al final puede elegir si darle 10 cupones a la gente del mismo servicio

Exacto 👍
Y lo que acabas de decir es correcto técnica y conceptualmente.
El supply = 1 era solo un caso particular, no una regla.

Vamos a dejarlo bien definido, como lo vería un especialista en blockchain.

1️⃣ Regla general (correcta)

En Stellar, un beneficio no es “un NFT”,
es un asset con reglas claras de emisión y uso.

Por lo tanto:

Supply = 1 → beneficio único (1 saludo, 1 obra, 1 acceso exclusivo)

Supply > 1 → beneficio repetible (cupones, accesos, servicios)

Ambos modelos son válidos y no rompen la arquitectura.

2️⃣ Modelo técnico correcto (flexible)
Definición de asset por beneficio

Cada beneficio se modela como:

Asset {
  code: BENEFIT_CODE
  issuer: PROJECT_ISSUER_ACCOUNT
  total_supply: N
}


Donde:

N puede ser 1, 10, 100, etc.

Cada unidad representa 1 derecho de uso.

Esto es exactamente cómo Stellar está pensado para operar.

3️⃣ Cómo se interpreta “NFT” aquí (importante)
No hablamos de NFT = ERC-721

Hablamos de:

Fungible units with non-financial semantics

Es decir:

Técnicamente fungibles

Semánticamente no financieros

Lógicamente cupones

Ejemplo:

10 cupones de café → supply 10

Cada cupón = 1 asset unit

Eso es mucho más eficiente que mint 10 NFTs separados.

4️⃣ Comparación de modelos
Caso	Supply	Transferible	Uso
Saludo único	1	No	Simbólico
Acceso beta	100	Opcional	Acceso
Cupón café	10	No	Canje
Descuento	500	No	Utilidad
5️⃣ Control de uso (canje)

Como Stellar no tiene estado complejo sin contratos:

El “uso” se controla off-chain:

Al canjear:

El backend verifica balance

Marca el cupón como usado en DB

Opcional: quema (send back + lock)

Esto es:

Simple

Seguro

Suficiente para MVP

6️⃣ ¿Cuándo sí usar supply = 1?

Solo cuando:

El beneficio es intrínsecamente único

No puede dividirse

Tiene valor simbólico fuerte

Ejemplos:

Video personalizado

Arte digital único

Certificado nominativo

7️⃣ ¿Cuándo usar supply > 1?

La mayoría de los casos reales:

Cupones

Entradas

Servicios

Accesos

Beneficios por tramo de donación

👉 Esto es más barato, más simple y más usable.

8️⃣ Flags recomendados por tipo de beneficio

Para cupones (supply > 1):

AUTH_REQUIRED = true

AUTH_REVOCABLE = true

Transferencias opcionalmente bloqueadas

Para beneficios únicos:

Transferencia opcional

Freeze tras emisión

9️⃣ Qué decir si te preguntan “¿esto sigue siendo NFT?”

Respuesta técnica correcta:

We model benefits as Stellar native assets.
Depending on the use case, the supply can be one or multiple units.
The key property is that ownership and quantity are verifiable on-chain.

Eso demuestra que entiendes Stellar, no que copiaste ERC-721.

🔟 Conclusión técnica

✔ Supply flexible
✔ Modelo nativo Stellar
✔ Sin sobreingeniería
✔ Escalable
✔ Alineado al caso de uso real

La unidad de valor no es el token, es el beneficio.

Si quieres, el siguiente paso natural es:

Definir qué tipo de beneficio usa qué supply

Diseñar cómo se canjea

Ajustar la BD para soportar ambos casos

Vas exactamente por el camino correcto.

el canjeo podria ser con fecha de validacion, por ejemplo cualquier cupon valido entre x fecha y a fecha o tambien podrian ser bajo demanda, con horarios de realización

Sí — eso encaja perfecto con el modelo, y además es exactamente el tipo de lógica que Stellar delega bien a off-chain sin forzar smart contracts.

Te explico cómo se modela correctamente, sin romper escalabilidad ni complejidad.

1️⃣ Concepto clave (muy importante)

Stellar valida propiedad y cantidad.
El sistema valida condiciones de uso.

No intentes meter:

Fechas

Horarios

Estados de uso

en la blockchain.

Eso no es lo que Stellar hace bien.

2️⃣ Tipos de canje que propones (todos válidos)
🅰️ Canje por rango de fechas

Ejemplo:

Cupón válido del 01/06/2026 al 30/06/2026

Se puede usar cualquier día dentro del rango

✔ Muy común
✔ Fácil de validar
✔ Ideal para pymes

🅱️ Canje bajo demanda con horarios

Ejemplo:

Sesión de mentoría

Saludo personalizado

Servicio digital

Condiciones:

Requiere agendamiento

Horarios disponibles

Ejecución posterior

✔ Perfecto para servicios
✔ No requiere supply = 1
✔ Escalable

🅲 Canje híbrido

Ejemplo:

NFT de acceso + horario reservado

Cupón válido, pero debe agendar

3️⃣ Modelo técnico correcto (blockchain + DB)
En Stellar (on-chain):

Asset

Issuer

Holder

Balance

Nada más.

En Base de Datos (off-chain):

Aquí vive toda la lógica real.

Ejemplo conceptual:

benefits
- id
- project_id
- asset_code
- total_supply
- redeem_type (date_range | on_demand | hybrid)
- valid_from
- valid_until
- timezone

benefit_redemptions
- id
- benefit_id
- user_id
- redeemed_at
- status

benefit_schedules
- id
- benefit_id
- start_time
- end_time
- is_booked

 Flujo técnico: canje por fecha

Usuario conecta wallet

Backend verifica:

balance >= 1

fecha actual ∈ rango válido

Marca cupón como usado

Opcional:

quema token

o marca off-chain

✔ Simple
✔ Audit friendly
✔ UX clara

 Flujo técnico: canje bajo demanda

Usuario selecciona horario

Backend:

valida disponibilidad

bloquea slot

Usuario confirma

Cupón queda:

reservado

luego consumido

✔ Evita dobles reservas
✔ No requiere contratos

 ¿Por qué NO on-chain?

Porque:

Fechas cambian

Horarios cambian

Reprogramaciones existen

Meter esto en contratos:

Aumenta bugs

Aumenta gas

Reduce flexibilidad

 Off-chain es la decisión correcta.

 Cómo explicarlo a un técnico exigente

Texto exacto:

Asset ownership is enforced on-chain using Stellar’s native asset model.
All business logic related to redemption conditions (time windows, scheduling, expiration) is handled off-chain to preserve flexibility and reduce on-chain complexity.

Eso es best practice.

 Seguridad y anti-abuso

FK estrictas

Índices por benefit_id

Unique constraints para evitar doble canje

Verificación on-chain previa a cada canje

 Escalabilidad

Este modelo escala porque:

Blockchain solo maneja ownership

DB maneja estados mutables

No necesitas migrar contratos
 Conclusión

✔ Fechas: perfecto
✔ Horarios: perfecto
✔ Bajo demanda: perfecto
✔ Sin contratos: correcto

Stellar certifica quién tiene el derecho.
Tu sistema decide cuándo y cómo se ejerce.