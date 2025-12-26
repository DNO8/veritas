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
