

# Plan: Reactivate Supabase Database and Restore Full Functionality

## Current Situation

Your Supabase database is **paused** (confirmed - API requests fail to connect). The frontend code is functional but falls back to mock data since it can't reach the database. The project has 32 migrations that define your full schema.

## Step 1: Reactivate the Supabase Database (Manual Action Required)

You need to unpause your Supabase project:
1. Go to https://supabase.com/dashboard/project/ikwttetqfltpxpkbqgpj
2. Click **"Restore project"** or **"Resume project"** button
3. Wait 2-3 minutes for the database to come back online

**This is the root cause** - once the database is running, authentication (sign up, login, email confirmation) and all data queries will work again.

## Step 2: Reconnect Supabase Integration

The Supabase authentication in Lovable has expired (shown in the error: `SUPABASE_UNAUTHORIZED`). After restoring the database:
1. Go to your Lovable project settings
2. Reconnect the Supabase integration to refresh the auth token

## Step 3: Fix the Navbar Hook Violation

The `Navbar` component at `src/components/ui/navbar.tsx` has a React hook rule violation - `useEffect` is called **after** a conditional `return` (the loading check at line 23). This will cause runtime errors. Fix by moving hooks before the conditional return.

## Step 4: Standardize Logo Across All Pages

The logo is inconsistent:
- **Header** (`src/components/layout/Header.tsx`): Uses a gradient `div` with "X" text
- **Navbar** (`src/components/ui/navbar.tsx`): Likely uses a different logo
- **Auth page** (`src/pages/Auth.tsx`): Uses `public/logo-xegai.png`

**Fix**: Create a reusable `Logo` component that uses the `logo-xegai.png` image consistently, and replace all logo instances in Header, Navbar, Footer, and Auth pages.

## Step 5: Make Products & Categories Resilient to DB Downtime

Currently, `FeaturedProducts` falls back to mock data when the DB is unreachable (good). But:
- `CategoriesSection` uses hardcoded data (fine as fallback)
- `Navbar` calls `fetch_categories_with_subcategories` RPC which may not exist after DB restore

**Fix**: Update `useProducts` and `useCategories` hooks to gracefully handle DB errors and fall back to mock data so the site always renders properly.

## Step 6: Verify Auth Email Configuration

After the database is restored, Supabase email confirmations should work automatically since:
- `enable_confirmations` is `false` in config (users can sign up without email verification)
- The `handle_new_user` trigger creates profiles automatically

If you want email confirmations enabled, that's a setting in the Supabase dashboard under Authentication > Email.

## Technical Summary

```text
Priority Order:
1. Unpause Supabase DB (manual - dashboard)
2. Reconnect Supabase in Lovable (manual - settings)
3. Fix Navbar hooks ordering (code change)
4. Create unified Logo component (code change)  
5. Add error resilience to data hooks (code change)
```

## Files to Modify
- `src/components/ui/navbar.tsx` - Fix hook ordering, use Logo component
- `src/components/layout/Header.tsx` - Use Logo component
- `src/components/layout/Footer.tsx` - Use Logo component
- `src/pages/Auth.tsx` - Use Logo component
- **New**: `src/components/ui/logo.tsx` - Reusable logo component
- `src/hooks/useCategories.ts` - Add error fallback

