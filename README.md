# Palm Island Community Repository

**Preserving Our Stories, Building Our Future**

Community-controlled storytelling, impact measurement, and data sovereignty platform for Palm Island Community Company (PICC).

## Cultural Protocols & Data Sovereignty

This repository is built on **Indigenous Data Sovereignty** - the right of Indigenous peoples to control data about their communities, cultures, and territories.

### Core Principles
- **Community Ownership**: All content is owned and controlled by the Palm Island community
- **Cultural Sensitivity**: Proper protocols for sharing stories, especially elder knowledge
- **Permission-Based Access**: Different levels of access based on community roles
- **Attribution & Respect**: Proper acknowledgment of storytellers and knowledge holders

---

## Quick Start

```bash
cd web-platform
npm install
cp .env.local.example .env.local  # Configure your environment
npm run dev                        # Starts on http://localhost:3000
```

For port 4000: `PORT=4000 npm run dev`

## Project Structure

```
palm-island-repository/
├── web-platform/          # Next.js 14 application
│   ├── app/               # App router pages
│   │   ├── (public)/      # Public-facing pages
│   │   ├── api/           # API routes
│   │   ├── picc/          # Admin dashboard
│   │   └── wiki/          # Knowledge base
│   ├── components/        # React components
│   ├── lib/               # Utilities and services
│   └── scripts/           # Database and utility scripts
├── docs/                  # Documentation
│   ├── setup/             # Installation guides
│   ├── architecture/      # System architecture
│   ├── guides/            # User and developer guides
│   └── archive/           # Historical documentation
├── annual-reports/        # Annual report templates
└── templates/             # Service templates
```

## Git Workflow

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production-ready code | Production |
| `develop` | Integration & testing | Staging |
| `feature/*` | New features | Local |
| `fix/*` | Bug fixes | Local |

### Development Flow
1. Create branch from `develop`: `git checkout -b feature/my-feature develop`
2. Make changes, commit, push
3. Create PR to `develop` for testing
4. Merge `develop` → `main` for production release

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4, Vector embeddings
- **Deployment**: Vercel

## Key Features

- **Community Stories**: First-person narratives from Palm Islanders
- **Annual Reports**: 15 years of interactive reports with AI search
- **Knowledge Wiki**: Comprehensive knowledge base
- **Media Management**: Photos, videos, and audio collections
- **AI Assistant**: Context-aware Q&A about PICC

## Documentation

- [Setup Guide](docs/setup/SETUP.md)
- [Architecture](docs/architecture/OVERVIEW.md)
- [Contributing](CONTRIBUTING.md)
- [Historical Docs](docs/archive/) - Previous documentation archive

---

*"Our stories are our strength. Our data is our sovereignty."*

© Palm Island Community Company
