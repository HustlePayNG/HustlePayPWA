# 🚀 HustlePay Live Supabase Authentication & Backend Guide

This step-by-step guide explains how to connect your **HustlePay PWA** to your live **Supabase** backend (`qcgrkcsrnnuvdcfcfvem.supabase.co`), run the SQL database migration, and test live Google authentication.

---

## 📌 **Step 1: Instantiating the Database (SQL Migration)**

1. Open your **Supabase Project Dashboard**:
   👉 [https://supabase.com/dashboard/project/qcgrkcsrnnuvdcfcfvem](https://supabase.com/dashboard/project/qcgrkcsrnnuvdcfcfvem)

2. Navigate to **SQL Editor** on the left menu sidebar.
3. Click **+ New Query**.
4. Open the `supabase_schema.sql` file in your workspace:
   📄 [`HustlePayPWA/supabase_schema.sql`](./supabase_schema.sql)
5. Copy all SQL commands and paste them into the Supabase SQL Editor.
6. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).

> **What this does**:
> - Creates PostgreSQL tables: `profiles`, `wallets`, `transactions`, `bookings`, `marketplace_jobs`, `job_proposals`, `artisan_posts`, and `post_comments`.
> - Enables **PostGIS Spatial** extension for 10km radius artisan search (`get_nearby_artisans`).
> - Installs `handle_new_user()` trigger to automatically create a **Seeker profile & wallet** upon user signup.
> - Enables `become_artisan(...)` function to upgrade seekers to Artisans after KYC completion.
> - Enforces Row Level Security (RLS) policies.

---

## 🔐 **Step 2: Configuring Live Google OAuth**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create your project **HustlePay**.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Set Application Type to **Web Application**:
   - **Authorized JavaScript Origins**:
     - `http://localhost:5173`
     - `https://qcgrkcsrnnuvdcfcfvem.supabase.co`
   - **Authorized Redirect URIs**:
     - `https://qcgrkcsrnnuvdcfcfvem.supabase.co/auth/v1/callback`
5. Copy your **Client ID** and **Client Secret**.
6. Open **Supabase Dashboard → Authentication → Providers → Google**:
   - Toggle **Enable Google provider**.
   - Paste **Client ID** & **Client Secret**.
   - Click **Save**.

---

## ⚡ **Step 3: PWA Frontend Wiring Summary**

Your PWA is already configured to point to your live Supabase instance!

- **Environment File**: [`.env`](./.env) contains:
  ```env
  VITE_SUPABASE_URL=https://qcgrkcsrnnuvdcfcfvem.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Auth Client**: Configured in [`src/services/supabase.ts`](./src/services/supabase.ts).
- **Database Adapter**: Configured in [`src/services/supabaseDb.ts`](./src/services/supabaseDb.ts).
- **OAuth Callback Route**: Handles redirects at `/auth/callback` via [`src/pages/AuthCallback.tsx`](./src/pages/AuthCallback.tsx).

---

## 🧪 **Step 4: Testing Live Authentication**

1. Start your local dev server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:5173/login`.
3. Click **Continue with Google** to test live OAuth redirection!
