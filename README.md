# SREF Mining Co

**SREF Mining Co** is a modern web application that pairs public-facing marketing pages with a secure, feature-rich dashboard for registered users.  
Users can register, log in and organise premium *SREF* codes inside folders, bookmark favourites and more.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tech Stack

| Layer          | Technology |
| -------------- | ---------- |
| Framework      | Next.js 14 (App Router, TypeScript) |
| UI / Styling   | React 18, Tailwind CSS v3, Lucide-React icons, Framer Motion |
| State / Forms  | React-Hook-Form, Zod (validation), React-Hot-Toast (notifications) |
| Backend / DB   | Supabase v2 (PostgreSQL, Row Level Security, Auth, Storage) |
| Tooling        | ESLint, Playwright (e2e), pnpm / npm scripts |

## Environment Setup

The app relies on Supabase for authentication and database access.  
Create a `.env.local` file in the project root (or copy the sample):

```bash
cp .env.local.example .env.local   # sample file committed in the repo
```

Then fill in your keys (find them in **Supabase → Project Settings → API**):

```ini
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>

# Optional – server-side admin actions (DO **NOT** expose in client code)
# SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Restart the dev server after editing env vars.

## Running Locally

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open <http://localhost:3000> and register a new account to access the dashboard.

### Troubleshooting

| Problem | Fix |
| ------- | --- |
| Registration spinner / “timed out” | Ensure `.env.local` contains valid `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then restart `npm run dev`. |
| `Failed to create user profile` errors | Confirm Supabase SQL schema has run and RLS policies are enabled. |
| Email confirmation never arrives | Check “Auth → Settings → SMTP” in Supabase and your spam folder. |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
