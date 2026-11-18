# STUDY TECH

A bilingual (French / English), responsive learning platform foundation.

## Technology

- Vite + vanilla JavaScript for the frontend
- Supabase Auth for email/password authentication
- Supabase PostgreSQL for application data
- PostgreSQL Row Level Security (RLS) for access control
- Vercel for static frontend hosting

## Local development

Requirements: Node.js 20.19+ and npm.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Add your Supabase project URL and publishable/anon key to `.env.local`
4. Start the development server: `npm run dev`
5. Create a production build: `npm run build`

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/schema.sql`.
3. In Authentication settings, configure email confirmation and the allowed redirect URLs for your local and production domains.
4. Copy the Project URL and publishable (or legacy anon) key into the Vite environment variables.
5. Never expose the Supabase `service_role` key in frontend code or any `VITE_*` variable.

The SQL schema creates profiles automatically and includes courses, lessons, enrollments and lesson progress. Row Level Security is enabled on every application table. Public visitors can read published course content. Students can access only their own profile, enrollments and progress. Administrator-only policies protect course and lesson management.

## Create the first administrator

After registering the intended administrator account, find that user's UUID in Supabase Authentication > Users. Run the following statement in the Supabase SQL Editor, replacing the UUID:

```sql
update public.profiles
set role = 'admin'
where id = 'REPLACE_WITH_AUTH_USER_UUID';
```

Role changes are blocked for normal authenticated sessions. Promote administrators only from the trusted Supabase SQL Editor.

## Deployment on Vercel

- Import this GitHub repository into Vercel.
- Set the framework preset to Vite (or allow Vercel to detect it).
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel environment variables.
- Redeploy after changing environment variables.

## Current implementation status

- [x] Responsive bilingual public homepage
- [x] Vite production build configuration
- [x] Supabase browser client with PKCE session flow
- [x] Email/password registration and login interface
- [x] Profile creation trigger and database schema
- [x] RLS policies for profiles, courses, lessons, enrollments and progress
- [ ] Connect a real Supabase project and configure its environment variables
- [ ] Student dashboard and course player
- [ ] Administrator dashboard and content-management workflows
- [ ] Automated tests, accessibility review and end-to-end verification

The account interface will report that the service is not configured until valid Supabase project settings are supplied. This is intentional: the application must not pretend that registration works before a backend is connected.

## Security notes

- Do not commit `.env.local` or secrets.
- Never use a service-role key in the browser.
- Keep RLS enabled and review policies whenever new tables are added.
- Configure production email templates and redirect URLs before opening registration publicly.
