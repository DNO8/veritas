<div align="center">

# 🌟 Colmena Crownfunding

### Plataforma de Crowdfunding Transparente Construida sobre Stellar

[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

**Presentación para Stellar Ideathon 2026**

[Demo](#) • [Documentación](#-características) • [Contribuir](#-cómo-contribuir)

</div>

---

## 📖 Acerca de

**VERITAS** es una plataforma descentralizada de crowdfunding que permite a **proyectos, startups, PYMEs e individuos** recibir donaciones transparentes utilizando la **blockchain de Stellar**. Construida para el [Stellar Ideathon 2026](https://dorahacks.io/hackathon/ideaton2026/detail), VERITAS combina la accesibilidad de Web2 con la transparencia de Web3.

### 🎯 Misión

Hacer que las donaciones basadas en blockchain sean accesibles para todos, independientemente de su experiencia con criptomonedas, manteniendo total transparencia y cero custodia de fondos.

### ✨ ¿Por qué Stellar?

- ⚡ **Transacciones rápidas** - Finalidad casi instantánea (3-5 segundos)
- 💰 **Comisiones bajas** - Fracciones de centavo por transacción
- 🌍 **Soporte nativo de USDC** - Donaciones en stablecoin sin complejidad
- 🚀 **Perfecto para micro-donaciones** - Ideal para crowdfunding
- 🌎 **Amigable con LATAM** - Excelente infraestructura para América Latina
- 🔓 **No custodial** - Los usuarios mantienen control total de sus fondos

---

## 🚀 Características

### Funcionalidad Principal

- ✅ **Híbrido Web2 + Web3** - Los usuarios pueden navegar sin wallet
- ✅ **Google OAuth** - Onboarding fácil vía Supabase Auth
- ✅ **Integración con Freighter Wallet** - Conecta wallets de Stellar sin problemas
- ✅ **Soporte multi-activo** - Acepta donaciones en XLM y USDC
- ✅ **Testnet y Mainnet** - Soporte completo para ambas redes
- ✅ **Gestión de proyectos** - Crea, edita y publica proyectos
- ✅ **Portadas generadas por IA** - Auto-genera portadas si no se suben
- ✅ **Donaciones transparentes** - Todas las transacciones registradas on-chain
- ✅ **Seguimiento de uso de fondos** - Muestra a los donantes cómo se usarán los fondos
- ✅ **Visualización de roadmap** - Comparte hitos y objetivos del proyecto
- ✅ **Protección de rutas** - Flujos de autenticación seguros

### Aspectos Técnicos Destacados

- 🔐 **No custodial** - Transacciones directas wallet-a-wallet
- 📊 **PostgreSQL + Supabase** - Backend robusto con RLS
- 🧪 **Testing completo** - Jest + Testing Library (63 tests)
- 🎨 **UI minimalista** - Enfoque en funcionalidad sobre estética
- 📱 **Diseño responsivo** - Funciona en todos los dispositivos
- 🔒 **Seguridad primero** - Validación de inputs, protección de rutas, prevención de SQL injection

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16.1** (App Router)
- **React 19.2**
- **TypeScript 5**
- **TailwindCSS 4**

### Backend
- **Supabase** (Auth + PostgreSQL + Storage)
- **PostgreSQL** con Row Level Security (RLS)

### Blockchain
- **Stellar SDK 14.4.3**
- Integración con **Freighter Wallet**
- Soporte para **XLM** y **USDC**

### IA
- **Google Generative AI** (Gemini) para generación de portadas

### Testing y Calidad
- **Jest 30** + **Testing Library**
- **TypeScript** modo estricto
- **Biome** para formateo

---

## 📦 Instalación

### Prerequisitos

- **Node.js 20+**
- **pnpm** (gestor de paquetes recomendado)
- **Cuenta de Supabase** (para la base de datos)
- **Freighter Wallet** (para probar donaciones)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/veritas.git
cd veritas
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Variables de Entorno

Crea un archivo `.env.local` en el directorio raíz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
NEXT_SECRET_SUPABASE_KEY=tu_clave_de_servicio_de_supabase

# Google AI (para generación de portadas)
GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_de_google_ai

# Stellar (opcional - por defecto testnet)
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
```

### 4. Configuración de Base de Datos

Ejecuta el schema SQL en tu proyecto de Supabase:

```bash
# Copia el schema desde supabase/schema.sql al editor SQL de Supabase
# Luego ejecuta supabase/rls-policies.sql para las políticas de seguridad
```

### 5. Ejecutar Servidor de Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

---

## 🧪 Testing

### Ejecutar Todos los Tests

```bash
pnpm test
```

### Modo Watch (Desarrollo)

```bash
pnpm test:watch
```

### Reporte de Cobertura

```bash
pnpm test:coverage
```

### Test de Integración Stellar

```bash
pnpm test:stellar
```

**Wallet de Prueba:** `GAI74SI2CTURCDG6PGIXSG5B4KQ4E5GHEQMBS6Q4AJNYCHXRQZIJMRC7`

---

## 🏗️ Estructura del Proyecto

```
veritas/
├── src/
│   ├── app/                    # Páginas de Next.js App Router
│   │   ├── api/               # Rutas API
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── projects/          # Páginas de proyectos
│   │   └── ...
│   ├── components/            # Componentes React
│   ├── lib/
│   │   ├── auth/             # Utilidades de autenticación
│   │   ├── services/         # Lógica de negocio
│   │   ├── stellar/          # Integración Stellar SDK
│   │   └── supabase/         # Cliente Supabase
│   └── middleware.ts         # Middleware de Next.js
├── supabase/
│   ├── schema.sql            # Schema de base de datos
│   └── rls-policies.sql      # Políticas de seguridad
├── scripts/                   # Scripts de utilidad
└── __tests__/                # Archivos de test
```

---

## 🌐 Schema de Base de Datos

### Tablas Principales

- **users** - Perfiles de usuario (extiende Supabase auth)
- **projects** - Proyectos de crowdfunding
- **donations** - Registros de donaciones on-chain
- **project_media** - Imágenes/videos del proyecto
- **project_roadmap_items** - Hitos del proyecto
- **fund_usage** - Asignación transparente de fondos

### Características Clave

- ✅ **Direcciones de wallet nullable** - Los usuarios no necesitan wallets para navegar
- ✅ **Tipos enum** - `user_role`, `project_status`, `media_type`
- ✅ **Queries indexadas** - Optimizadas para rendimiento del feed
- ✅ **Eliminaciones en cascada** - Relaciones de datos limpias

---

## 💡 Cómo Funciona

### Para Creadores de Proyectos

1. **Regístrate** con Google OAuth
2. **Completa tu perfil** (nombre, rol)
3. **Crea proyecto** con descripción, objetivos y roadmap
4. **Conecta wallet de Stellar** (Freighter)
5. **Publica proyecto** para recibir donaciones

### Para Donantes

1. **Navega proyectos** (no se necesita wallet)
2. **Conecta Freighter wallet**
3. **Elige monto** y activo (XLM/USDC)
4. **Confirma transacción** en Freighter
5. **Donación registrada** on-chain y en base de datos

---

## 🏗️ Arquitectura Técnica

### ⚠️ Sin Smart Contracts (MVP)

**VERITAS NO utiliza smart contracts** en su versión actual. Las donaciones funcionan mediante **transacciones nativas de Stellar** (peer-to-peer).

### Flujo de Donación Completo

```
┌─────────────────┐
│  Usuario Donador │
└────────┬────────┘
         │ 1. Conecta Wallet (Freighter/Albedo)
         ▼
┌─────────────────────────┐
│   Frontend (Next.js)    │
│  - Crea transacción     │
│  - Usuario firma con    │
│    su wallet            │
└────────┬────────────────┘
         │ 2. Transacción firmada
         ▼
┌─────────────────────────┐
│   Stellar Network       │
│  - Ejecuta pago nativo  │
│  - Peer-to-peer         │
│  - Sin intermediarios   │
└────────┬────────────────┘
         │ 3. Tx Hash generado
         ▼
┌─────────────────────────┐
│  Wallet del Proyecto    │
│  - Recibe fondos        │
│    directamente         │
└─────────────────────────┘
         │
         │ 4. Backend verifica
         ▼
┌─────────────────────────┐
│  Stellar Horizon API    │
│  - Consulta tx por hash │
│  - Verifica destino     │
│  - Verifica monto       │
└────────┬────────────────┘
         │ 5. Si válida
         ▼
┌─────────────────────────┐
│  Supabase (PostgreSQL)  │
│  - Registra donación    │
│  - Actualiza proyecto   │
│  - Genera estadísticas  │
└─────────────────────────┘
```

### Componentes Clave

#### 1. **Stellar SDK (Cliente)**
```typescript
// src/lib/stellar/payment.ts
// Crea transacción nativa de Stellar (NO smart contract)
const transaction = new StellarSdk.TransactionBuilder(sourceAccount)
  .addOperation(
    StellarSdk.Operation.payment({
      destination: projectWallet,
      asset: StellarSdk.Asset.native(), // XLM
      amount: "200",
    })
  )
  .build();

// Usuario firma con su wallet
const signedXdr = await signTransaction(transaction.toXDR());

// Envía a Stellar Network
const result = await server.submitTransaction(signedTx);
```

#### 2. **Verificación de Pago (Backend)**
```typescript
// src/lib/stellar/client.ts
async verifyPayment(txHash, destinationWallet, amount, asset) {
  // 1. Consulta transacción en Stellar Horizon API
  const tx = await server.transactions().transaction(txHash).call();
  
  // 2. Obtiene operaciones de la transacción
  const operations = await tx.operations();
  
  // 3. Verifica que:
  //    - Existe una operación de pago
  //    - El destino es la wallet del proyecto
  //    - El monto coincide (con tolerancia de punto flotante)
  //    - El asset coincide (XLM/USDC)
  
  return { valid: true/false, error?: string };
}
```

#### 3. **Registro en Base de Datos**
```typescript
// src/lib/services/donations.ts
async createDonation(input) {
  // 1. Verifica que la tx existe y es válida
  const verification = await stellarClient.verifyPayment(...);
  
  if (!verification.valid) {
    throw new Error("Payment verification failed");
  }
  
  // 2. Guarda en Supabase
  const donation = await supabase.from("donations").insert({
    project_id: input.projectId,
    donor_wallet: input.donorWallet,
    amount: input.amount,
    asset: input.asset,
    tx_hash: input.txHash,
    network: input.network,
  });
  
  // 3. Actualiza total del proyecto
  await incrementProjectAmount(projectId, amount);
  
  return donation;
}
```

### ✅ Ventajas de Este Enfoque

| Aspecto | Beneficio |
|---------|-----------|
| **Simplicidad** | No requiere desplegar ni auditar smart contracts |
| **Costos** | Solo fees de Stellar (~0.00001 XLM por tx) |
| **Velocidad** | Transacciones instantáneas (3-5 segundos) |
| **Seguridad** | No custodial - fondos van directamente al proyecto |
| **Transparencia** | Todas las transacciones verificables en blockchain |
| **Escalabilidad** | No hay límites de gas ni congestión de red |

### 🔐 Seguridad

- ✅ **No custodial** - VERITAS nunca tiene acceso a los fondos
- ✅ **Verificación on-chain** - Cada donación se verifica en Stellar
- ✅ **Prevención de duplicados** - Se verifica que el tx_hash no exista
- ✅ **Validación de wallets** - Se valida formato de direcciones Stellar
- ✅ **Tolerancia de punto flotante** - Maneja diferencias mínimas en montos

### 🚀 Roadmap: Smart Contracts (Futuro)

Para funcionalidades avanzadas, se considerará **Soroban** (smart contracts de Stellar):

**Casos de uso futuros:**
- **Escrow con milestones** - Fondos liberados al cumplir objetivos
- **Reembolsos automáticos** - Si proyecto no alcanza meta
- **Gobernanza** - Donadores votan uso de fondos
- **NFTs de reconocimiento** - Badges automáticos para top donors

**Por ahora, el enfoque sin smart contracts es:**
- ✅ Más simple y robusto
- ✅ Ideal para MVP/Ideathon
- ✅ Suficiente para donaciones directas
- ✅ Fácil de auditar y mantener

---

### Flujo de Transacción

```
Wallet Donante → Red Stellar → Wallet Proyecto
                      ↓
               Hash de Transacción
                      ↓
          Base de Datos VERITAS (registro de auditoría)
```

**VERITAS nunca custodia fondos** - todas las transacciones son peer-to-peer.

---

## 🤝 Cómo Contribuir

¡Damos la bienvenida a contribuciones de la comunidad! Aquí está cómo empezar:

### 1. Hacer Fork del Repositorio

Haz clic en el botón **Fork** en la parte superior derecha de esta página.

### 2. Clonar tu Fork

```bash
git clone https://github.com/TU_USUARIO/veritas.git
cd veritas
```

### 3. Crear una Rama

```bash
git checkout -b feature/nombre-de-tu-feature
```

**Convenciones de nombres de ramas:**
- `feature/` - Nuevas características
- `fix/` - Corrección de bugs
- `docs/` - Actualizaciones de documentación
- `test/` - Mejoras de tests
- `refactor/` - Refactorización de código

### 4. Hacer tus Cambios

- Sigue el estilo de código existente
- Escribe/actualiza tests para nuevas características
- Actualiza documentación si es necesario
- Ejecuta tests antes de hacer commit

```bash
pnpm test
pnpm lint
```

### 5. Hacer Commit de tus Cambios

```bash
git add .
git commit -m "feat: agregar característica increíble"
```

**Formato de mensajes de commit:**
- `feat:` - Nueva característica
- `fix:` - Corrección de bug
- `docs:` - Documentación
- `test:` - Tests
- `refactor:` - Refactorización de código
- `style:` - Formateo

### 6. Push a tu Fork

```bash
git push origin feature/nombre-de-tu-feature
```

### 7. Crear un Pull Request

1. Ve al repositorio original
2. Haz clic en **Pull Requests** → **New Pull Request**
3. Selecciona tu fork y rama
4. Completa el template del PR:
   - **Descripción** - ¿Qué hace este PR?
   - **Issue Relacionado** - Enlaza issues relacionados
   - **Testing** - ¿Cómo probaste esto?
   - **Screenshots** - Si hay cambios de UI

### Guías para PR

✅ **HACER:**
- Escribir mensajes de commit claros y descriptivos
- Agregar tests para nuevas características
- Actualizar documentación
- Mantener PRs enfocados (una característica/fix por PR)
- Responder al feedback de revisión

❌ **NO HACER:**
- Enviar PRs con tests fallidos
- Incluir cambios no relacionados
- Modificar schema de base de datos sin discusión
- Agregar dependencias sin justificación

### Proceso de Revisión de Código

1. **Checks automatizados** - Tests, linting, type checking
2. **Revisión de código** - Al menos una aprobación de maintainer
3. **Testing** - Testing manual si es necesario
4. **Merge** - Squash and merge a main

---

## 🐛 Reportar Issues

¿Encontraste un bug? ¿Tienes una sugerencia?

1. **Revisa issues existentes** - Evita duplicados
2. **Crea un nuevo issue** con:
   - Título claro
   - Pasos para reproducir (para bugs)
   - Comportamiento esperado vs actual
   - Screenshots/logs si aplica
   - Entorno (OS, navegador, etc.)

---

## 📋 Guías de Desarrollo

### Principios Fundamentales

1. **Backend Primero** - Priorizar integridad de datos y lógica de negocio
2. **Sin Hardcoding** - Usar variables de entorno y base de datos
3. **Web2 + Web3** - Soportar usuarios con y sin wallets
4. **Validación en Todas Partes** - Nunca confiar en input del usuario
5. **Cobertura de Tests** - Escribir tests para rutas críticas

### Reglas de Base de Datos

- ❌ **Nunca modificar schema** sin discusión del equipo
- ✅ **Usar enums existentes** - `user_role`, `project_status`, `media_type`
- ✅ **Respetar campos nullable** - `wallet_address` puede ser NULL
- ✅ **Seguir convenciones de nombres** - snake_case para DB, camelCase para TS

### Reglas de Integración Stellar

- ✅ **Validar direcciones de wallet** - Usar `StrKey.isValidEd25519PublicKey`
- ✅ **Confirmar transacciones** - Esperar confirmación on-chain
- ✅ **Registrar todo** - `tx_hash`, `amount`, `asset`, `network`
- ✅ **Manejar errores con gracia** - Problemas de red, fondos insuficientes, etc.
- ❌ **Nunca asumir éxito** - Siempre verificar on-chain

---

## 🎯 Roadmap

### MVP (Actual)
- ✅ Autenticación de usuarios
- ✅ Creación y gestión de proyectos
- ✅ Integración con wallet de Stellar
- ✅ Donaciones en XLM y USDC
- ✅ Registro de transacciones

### Características Futuras
- 🔄 On-ramp fiat (Stripe/Flow)
- 🔄 Smart contracts Soroban
- 🔄 Financiamiento basado en hitos
- 🔄 Sistema de reputación de proyectos
- 🔄 Soporte multi-idioma
- 🔄 Aplicación móvil

---

## 📄 Licencia

Este proyecto es open source y está disponible bajo la [Licencia MIT](LICENSE).

---

## 🙏 Agradecimientos

- **Stellar Development Foundation** - Por la increíble blockchain
- **Supabase** - Por la infraestructura de backend
- **DoraHacks** - Por organizar el Ideathon
- **Contribuidores de la Comunidad** - Por hacer este proyecto mejor

---

## 📞 Contacto

- **GitHub Issues** - Para bugs y solicitudes de características
- **Discussions** - Para preguntas e ideas
- **Twitter** - [@veritas_stellar](#)

---

<div align="center">

**Construido con ❤️ para Stellar Ideathon 2026**

[⭐ Dale estrella a este repo](https://github.com/TU_USUARIO/veritas) • [🐛 Reportar Bug](https://github.com/TU_USUARIO/veritas/issues) • [💡 Solicitar Característica](https://github.com/TU_USUARIO/veritas/issues)

</div>

---
---
---

# 📖 English Version

<div align="center">

# 🌟 VERITAS

### Transparent Crowdfunding Platform Built on Stellar

[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

**Stellar Ideathon 2026 Submission**

[Demo](#) • [Documentation](#features) • [Contributing](#-contributing)

</div>

---

## 📖 About

**VERITAS** is a decentralized crowdfunding platform that empowers **projects, startups, SMEs, and individuals** to receive transparent donations using the **Stellar blockchain**. Built for the [Stellar Ideathon 2026](https://dorahacks.io/hackathon/ideaton2026/detail), VERITAS combines Web2 accessibility with Web3 transparency.

### 🎯 Mission

Make blockchain-based donations accessible to everyone, regardless of their crypto experience, while maintaining full transparency and zero custody of funds.

### ✨ Why Stellar?

- ⚡ **Fast transactions** - Near-instant finality (3-5 seconds)
- 💰 **Low fees** - Fractions of a cent per transaction
- 🌍 **Native USDC support** - Stablecoin donations without complexity
- 🚀 **Perfect for micro-donations** - Ideal for crowdfunding
- 🌎 **LATAM-friendly** - Excellent infrastructure for Latin America
- 🔓 **Non-custodial** - Users maintain full control of their funds

---

## 🚀 Features

### Core Functionality

- ✅ **Web2 + Web3 Hybrid** - Users can browse without a wallet
- ✅ **Google OAuth** - Easy onboarding via Supabase Auth
- ✅ **Freighter Wallet Integration** - Connect Stellar wallets seamlessly
- ✅ **Multi-asset Support** - Accept XLM and USDC donations
- ✅ **Testnet & Mainnet** - Full support for both networks
- ✅ **Project Management** - Create, edit, and publish projects
- ✅ **AI-Generated Covers** - Auto-generate project covers if not uploaded
- ✅ **Transparent Donations** - All transactions recorded on-chain
- ✅ **Fund Usage Tracking** - Show donors how funds will be used
- ✅ **Roadmap Display** - Share project milestones and goals
- ✅ **Route Protection** - Secure authentication flows

### Technical Highlights

- 🔐 **Non-custodial** - Direct wallet-to-wallet transactions
- 📊 **PostgreSQL + Supabase** - Robust backend with RLS
- 🧪 **Comprehensive Testing** - Jest + Testing Library (63 tests)
- 🎨 **Minimal UI** - Focus on functionality over aesthetics
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Security First** - Input validation, route protection, SQL injection prevention

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1** (App Router)
- **React 19.2**
- **TypeScript 5**
- **TailwindCSS 4**

### Backend
- **Supabase** (Auth + PostgreSQL + Storage)
- **PostgreSQL** with Row Level Security (RLS)

### Blockchain
- **Stellar SDK 14.4.3**
- **Freighter Wallet** integration
- Support for **XLM** and **USDC**

### AI
- **Google Generative AI** (Gemini) for cover generation

### Testing & Quality
- **Jest 30** + **Testing Library**
- **TypeScript** strict mode
- **Biome** for formatting

---

## 📦 Installation

### Prerequisites

- **Node.js 20+**
- **pnpm** (recommended package manager)
- **Supabase account** (for database)
- **Freighter Wallet** (for testing donations)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/veritas.git
cd veritas
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_SECRET_SUPABASE_KEY=your_supabase_service_key

# Google AI (for cover generation)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Stellar (optional - defaults to testnet)
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
```

### 4. Database Setup

Run the SQL schema in your Supabase project:

```bash
# Copy the schema from supabase/schema.sql to your Supabase SQL editor
# Then run supabase/rls-policies.sql for security policies
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Watch Mode (Development)

```bash
pnpm test:watch
```

### Coverage Report

```bash
pnpm test:coverage
```

### Test Stellar Integration

```bash
pnpm test:stellar
```

**Test Wallet:** `GAI74SI2CTURCDG6PGIXSG5B4KQ4E5GHEQMBS6Q4AJNYCHXRQZIJMRC7`

---

## 🏗️ Project Structure

```
veritas/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── projects/          # Project pages
│   │   └── ...
│   ├── components/            # React components
│   ├── lib/
│   │   ├── auth/             # Auth utilities
│   │   ├── services/         # Business logic
│   │   ├── stellar/          # Stellar SDK integration
│   │   └── supabase/         # Supabase client
│   └── middleware.ts         # Next.js middleware
├── supabase/
│   ├── schema.sql            # Database schema
│   └── rls-policies.sql      # Security policies
├── scripts/                   # Utility scripts
└── __tests__/                # Test files
```

---

## 🌐 Database Schema

### Core Tables

- **users** - User profiles (extends Supabase auth)
- **projects** - Crowdfunding projects
- **donations** - On-chain donation records
- **project_media** - Project images/videos
- **project_roadmap_items** - Project milestones
- **fund_usage** - Transparent fund allocation

### Key Features

- ✅ **Nullable wallet addresses** - Users don't need wallets to browse
- ✅ **Enum types** - `user_role`, `project_status`, `media_type`
- ✅ **Indexed queries** - Optimized for feed performance
- ✅ **Cascade deletes** - Clean data relationships

---

## 💡 How It Works

### For Project Creators

1. **Sign up** with Google OAuth
2. **Complete profile** (name, role)
3. **Create project** with description, goals, and roadmap
4. **Connect Stellar wallet** (Freighter)
5. **Publish project** to receive donations

### For Donors

1. **Browse projects** (no wallet needed)
2. **Connect Freighter wallet**
3. **Choose amount** and asset (XLM/USDC)
4. **Confirm transaction** in Freighter
5. **Donation recorded** on-chain and in database

---

## 🏗️ Technical Architecture

### ⚠️ No Smart Contracts (MVP)

**VERITAS does NOT use smart contracts** in its current version. Donations work through **native Stellar transactions** (peer-to-peer).

### Complete Donation Flow

```
┌─────────────────┐
│   Donor User    │
└────────┬────────┘
         │ 1. Connect Wallet (Freighter/Albedo)
         ▼
┌─────────────────────────┐
│   Frontend (Next.js)    │
│  - Creates transaction  │
│  - User signs with      │
│    their wallet         │
└────────┬────────────────┘
         │ 2. Signed transaction
         ▼
┌─────────────────────────┐
│   Stellar Network       │
│  - Executes native pay  │
│  - Peer-to-peer         │
│  - No intermediaries    │
└────────┬────────────────┘
         │ 3. Tx Hash generated
         ▼
┌─────────────────────────┐
│   Project Wallet        │
│  - Receives funds       │
│    directly             │
└─────────────────────────┘
         │
         │ 4. Backend verifies
         ▼
┌─────────────────────────┐
│  Stellar Horizon API    │
│  - Query tx by hash     │
│  - Verify destination   │
│  - Verify amount        │
└────────┬────────────────┘
         │ 5. If valid
         ▼
┌─────────────────────────┐
│  Supabase (PostgreSQL)  │
│  - Record donation      │
│  - Update project       │
│  - Generate stats       │
└─────────────────────────┘
```

### Key Components

#### 1. **Stellar SDK (Client)**
```typescript
// src/lib/stellar/payment.ts
// Creates native Stellar transaction (NOT a smart contract)
const transaction = new StellarSdk.TransactionBuilder(sourceAccount)
  .addOperation(
    StellarSdk.Operation.payment({
      destination: projectWallet,
      asset: StellarSdk.Asset.native(), // XLM
      amount: "200",
    })
  )
  .build();

// User signs with their wallet
const signedXdr = await signTransaction(transaction.toXDR());

// Submit to Stellar Network
const result = await server.submitTransaction(signedTx);
```

#### 2. **Payment Verification (Backend)**
```typescript
// src/lib/stellar/client.ts
async verifyPayment(txHash, destinationWallet, amount, asset) {
  // 1. Query transaction on Stellar Horizon API
  const tx = await server.transactions().transaction(txHash).call();
  
  // 2. Get transaction operations
  const operations = await tx.operations();
  
  // 3. Verify that:
  //    - A payment operation exists
  //    - Destination is the project wallet
  //    - Amount matches (with floating point tolerance)
  //    - Asset matches (XLM/USDC)
  
  return { valid: true/false, error?: string };
}
```

#### 3. **Database Recording**
```typescript
// src/lib/services/donations.ts
async createDonation(input) {
  // 1. Verify tx exists and is valid
  const verification = await stellarClient.verifyPayment(...);
  
  if (!verification.valid) {
    throw new Error("Payment verification failed");
  }
  
  // 2. Save to Supabase
  const donation = await supabase.from("donations").insert({
    project_id: input.projectId,
    donor_wallet: input.donorWallet,
    amount: input.amount,
    asset: input.asset,
    tx_hash: input.txHash,
    network: input.network,
  });
  
  // 3. Update project total
  await incrementProjectAmount(projectId, amount);
  
  return donation;
}
```

### ✅ Advantages of This Approach

| Aspect | Benefit |
|---------|-----------|
| **Simplicity** | No need to deploy or audit smart contracts |
| **Costs** | Only Stellar fees (~0.00001 XLM per tx) |
| **Speed** | Instant transactions (3-5 seconds) |
| **Security** | Non-custodial - funds go directly to project |
| **Transparency** | All transactions verifiable on blockchain |
| **Scalability** | No gas limits or network congestion |

### 🔐 Security

- ✅ **Non-custodial** - VERITAS never has access to funds
- ✅ **On-chain verification** - Each donation verified on Stellar
- ✅ **Duplicate prevention** - Checks tx_hash doesn't exist
- ✅ **Wallet validation** - Validates Stellar address format
- ✅ **Floating point tolerance** - Handles minimal amount differences

### 🚀 Roadmap: Smart Contracts (Future)

For advanced features, **Soroban** (Stellar smart contracts) will be considered:

**Future use cases:**
- **Escrow with milestones** - Funds released upon goal completion
- **Automatic refunds** - If project doesn't reach goal
- **Governance** - Donors vote on fund usage
- **Recognition NFTs** - Automatic badges for top donors

**For now, the no-smart-contract approach is:**
- ✅ Simpler and more robust
- ✅ Ideal for MVP/Ideathon
- ✅ Sufficient for direct donations
- ✅ Easy to audit and maintain

---

### Transaction Flow

```
Donor Wallet → Stellar Network → Project Wallet
                     ↓
              Transaction Hash
                     ↓
            VERITAS Database (audit trail)
```

**VERITAS never holds funds** - all transactions are peer-to-peer.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### 1. Fork the Repository

Click the **Fork** button at the top right of this page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/veritas.git
cd veritas
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test improvements
- `refactor/` - Code refactoring

### 4. Make Your Changes

- Follow existing code style
- Write/update tests for new features
- Update documentation if needed
- Run tests before committing

```bash
pnpm test
pnpm lint
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `style:` - Formatting

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

1. Go to the original repository
2. Click **Pull Requests** → **New Pull Request**
3. Select your fork and branch
4. Fill out the PR template:
   - **Description** - What does this PR do?
   - **Related Issue** - Link any related issues
   - **Testing** - How did you test this?
   - **Screenshots** - If UI changes

### PR Guidelines

✅ **DO:**
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation
- Keep PRs focused (one feature/fix per PR)
- Respond to review feedback

❌ **DON'T:**
- Submit PRs with failing tests
- Include unrelated changes
- Modify database schema without discussion
- Add dependencies without justification

### Code Review Process

1. **Automated checks** - Tests, linting, type checking
2. **Code review** - At least one maintainer approval
3. **Testing** - Manual testing if needed
4. **Merge** - Squash and merge to main

---

## 🐛 Reporting Issues

Found a bug? Have a suggestion?

1. **Check existing issues** - Avoid duplicates
2. **Create a new issue** with:
   - Clear title
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots/logs if applicable
   - Environment (OS, browser, etc.)

---

## 📋 Development Guidelines

### Core Principles

1. **Backend First** - Prioritize data integrity and business logic
2. **No Hardcoding** - Use environment variables and database
3. **Web2 + Web3** - Support users with and without wallets
4. **Validation Everywhere** - Never trust user input
5. **Test Coverage** - Write tests for critical paths

### Database Rules

- ❌ **Never modify schema** without team discussion
- ✅ **Use existing enums** - `user_role`, `project_status`, `media_type`
- ✅ **Respect nullable fields** - `wallet_address` can be NULL
- ✅ **Follow naming conventions** - snake_case for DB, camelCase for TS

### Stellar Integration Rules

- ✅ **Validate wallet addresses** - Use `StrKey.isValidEd25519PublicKey`
- ✅ **Confirm transactions** - Wait for on-chain confirmation
- ✅ **Record everything** - `tx_hash`, `amount`, `asset`, `network`
- ✅ **Handle errors gracefully** - Network issues, insufficient funds, etc.
- ❌ **Never assume success** - Always verify on-chain

---

## 🎯 Roadmap

### MVP (Current)
- ✅ User authentication
- ✅ Project creation and management
- ✅ Stellar wallet integration
- ✅ XLM and USDC donations
- ✅ Transaction recording

### Future Features
- 🔄 Fiat on-ramp (Stripe/Flow)
- 🔄 Soroban smart contracts
- 🔄 Milestone-based funding
- 🔄 Project reputation system
- 🔄 Multi-language support
- 🔄 Mobile app

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** - For the amazing blockchain
- **Supabase** - For the backend infrastructure
- **DoraHacks** - For hosting the Ideathon
- **Community Contributors** - For making this project better

---

## 📞 Contact

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and ideas
- **Twitter** - [@veritas_stellar](#)

---

<div align="center">

**Built with ❤️ for the Stellar Ideathon 2026**

[⭐ Star this repo](https://github.com/YOUR_USERNAME/veritas) • [🐛 Report Bug](https://github.com/YOUR_USERNAME/veritas/issues) • [💡 Request Feature](https://github.com/YOUR_USERNAME/veritas/issues)

</div>
