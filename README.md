# NestScout

A modern, premium real estate marketplace connecting verified landlords with prospective tenants. Built with performance, security, and aesthetics in mind.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4, Framer Motion
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Maps:** React Leaflet
- **Deployment:** Vercel Edge Network

## Setup & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Duplicate the `.env.example` file, rename it to `.env.local`, and populate the required keys:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Security
- **Strict Configuration:** This repository does not commit `.env` variables.
- **Global Authentication:** The application uses Next.js Middleware to enforce global route protection.
- **Data Protection:** Supabase Row Level Security ensures users can only access their authorized relational rows.

---
*Private Repository — NestScout MVP*
