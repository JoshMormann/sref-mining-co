# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential commands for development:**
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js rules

## Project Architecture

**Technology Stack:**
- Next.js 14 with App Router and TypeScript
- Supabase for authentication and database
- Tailwind CSS with custom mining-themed design system
- React Hook Form with Zod validation
- Framer Motion for animations

**Database Architecture:**
The Supabase schema (`supabase/schema.sql`) defines a complete SREF mining platform:
- Users with tiered access (miner/collector/admin)
- SREF codes with SV4/SV6 version support
- Folder organization with smart folders
- Engagement tracking (upvotes, saves, copies)
- Waitlist management

**Key Application Structure:**
- `/` - Landing page with SREF explanation and recent codes feed
- `/dashboard` - Main authenticated user interface with mining-themed UI
- `/auth/login` & `/auth/register` - Authentication flows
- Custom Supabase context in `src/app/providers.tsx` handles auth state

**Component Organization:**
- `components/sref/` - SREF code-related components (cards, feeds, modals)
- `components/folders/` - Folder management UI
- `lib/utils.ts` - Utility functions including SREF display formatting

**Design System:**
Custom Tailwind config with mining-themed colors:
- Primary: MidJourney blue (#5865F2)
- Secondary: Dark slate for mining theme
- Accent: Gold (#FFD700) for mining theme
- Dark mode enabled by default

**Authentication Flow:**
Supabase auth with custom user profile creation including username validation. The providers context manages auth state globally and provides auth methods (signUp, signIn, signOut, resetPassword).

**Path Aliases:**
- `@/*` maps to `src/*` for clean imports

**Key Features:**
- SREF code discovery and sharing platform
- Support for both SV4 and SV6 MidJourney style versions
- User tiers (miner, collector, admin) with different access levels
- Folder organization with smart folder capabilities
- Engagement features (upvotes, saves, copy tracking)