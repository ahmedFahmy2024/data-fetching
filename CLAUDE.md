# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Start PostgreSQL database via Docker
docker-compose up -d
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Run Biome linter
npm run lint

# Format code with Biome
npm run format
```

### Database (Drizzle ORM)
```bash
# Generate migrations
npx drizzle-kit generate

# Push schema changes to database
npx drizzle-kit push

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio
```

## Architecture Overview

This is a **Next.js 16** application using the App Router architecture, React Compiler (React 19), and Drizzle ORM for database management.

### Tech Stack
- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript (strict mode enabled)
- **Linting/Formatting**: Biome 2.2.0
- **Environment Variables**: T3-oss/env-nextjs
- **React Compiler**: Enabled in `next.config.ts` (automatic optimization)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── data/
│   └── env/               # Environment variable schemas
│       ├── server.ts      # Server-side env validation
│       └── client.ts      # Client-side env validation
└── drizzle/
    ├── db.ts              # Database connection (drizzle instance)
    ├── schema.ts          # Re-exports all schemas from schema/ folder
    ├── schema/            # Individual schema definitions
    │   ├── user.ts        # Users table schema
    │   └── post.ts        # Posts table schema
    └── schemaHelpers.ts   # Shared schema helpers (id, timestamps)
```

### Key Configuration Files

- **biome.json** - Biome linter/formatter configuration with Next.js and React rules
- **drizzle.config.ts** - Drizzle ORM configuration for PostgreSQL
- **tsconfig.json** - TypeScript config with path aliases (`@/*` → `./src/*`)
- **next.config.ts** - Next.js config with React Compiler enabled
- **docker-compose.yml** - PostgreSQL 17.0 database service (port 5435)
- **.env** - Environment variables for local development

### Database Schema

Schema files are organized in `src/drizzle/schema/`:
- **user.ts** - Users table: id, name, email (unique), passwordHash
- **post.ts** - Posts table: id, userId (FK to users), title, content, published flag

Common columns are defined in `schemaHelpers.ts`:
- `id` - UUID primary key with default random generation
- `createdAt` - Timestamp with timezone, defaults to now
- `updatedAt` - Timestamp with timezone, defaults to now with auto-update on changes

All schemas are re-exported from `src/drizzle/schema.ts` for easy importing.

### Environment Variables

Environment variables are validated using T3-oss/env-nextjs in `src/data/env/server.ts`:
- `DB_PASSWORD` - Database password
- `DB_USER` - Database username
- `DB_NAME` - Database name
- `DB_HOST` - Database host
- `DB_PORT` - Database port

These are combined into a `DATABASE_URL` for Drizzle: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`