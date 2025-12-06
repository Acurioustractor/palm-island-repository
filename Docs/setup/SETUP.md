# Setup Guide

## Prerequisites

- Node.js 18+ (recommend 20.x)
- npm 9+
- Git
- Supabase account (for database)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Acurioustractor/palm-island-repository.git
cd palm-island-repository
```

### 2. Install Dependencies

```bash
cd web-platform
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Configure the following variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

For a different port:
```bash
PORT=4000 npm run dev
```

## Database Setup

The application uses Supabase. Database migrations are in:
- `web-platform/lib/empathy-ledger/migrations/`
- `web-platform/supabase/migrations/`

To apply migrations, use the Supabase dashboard SQL editor or CLI.

## Verification

After setup, verify these pages load:
- http://localhost:3000 - Home page
- http://localhost:3000/stories - Stories listing
- http://localhost:3000/wiki - Knowledge wiki

## Troubleshooting

### Port Already in Use
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
Ensure `.env.local` is in the `web-platform/` directory, not the root.
