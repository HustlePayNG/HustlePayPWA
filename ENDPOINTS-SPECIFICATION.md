# 📡 HustlePay PWA — Complete API & Endpoint Specification

This document provides a comprehensive inventory of **every backend endpoint, database operation, storage bucket action, and real-time WebSocket channel** required by the **HustlePay PWA** frontend.

---

## 📑 **Table of Contents**
1. [Authentication & Account Management](#1-authentication--account-management)
2. [Artisan Onboarding & KYC Verification](#2-artisan-onboarding--kyc-verification)
3. [Artisan Profile & Availability Management](#3-artisan-profile--availability-management)
4. [Artisan Discovery & Search (PostGIS Spatial)](#4-artisan-discovery--search-postgis-spatial)
5. [Direct Booking Pipeline & Escrow Lifecycle](#5-direct-booking-pipeline--escrow-lifecycle)
6. [Open Job Marketplace & Bidding System](#6-open-job-marketplace--bidding-system)
7. [Wallet & Payment Transactions](#7-wallet--payment-transactions)
8. [Social Media Feed (Discover)](#8-social-media-feed-discover)
9. [In-App Chat & Realtime Messaging](#9-in-app-chat--realtime-messaging)
10. [Notifications & Customer Support](#10-notifications--customer-support)

---

## 1. Authentication & Account Management

All users register through a **unified single-account flow** and start as **Seekers**.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `POST` | `supabase.auth.signUp()` | Register new account with email, password, full name, phone, and address. Auto-creates `profiles` & `wallets` records. | [`src/pages/Signup.tsx`](./src/pages/Signup.tsx) |
| `POST` | `supabase.auth.signInWithPassword()` | Sign in user with email and password. | [`src/pages/Login.tsx`](./src/pages/Login.tsx) |
| `POST` | `supabase.auth.signInWithOAuth()` | Initiate Google OAuth 2.0 redirect flow. | [`src/pages/Login.tsx`](./src/pages/Login.tsx), [`src/pages/Signup.tsx`](./src/pages/Signup.tsx) |
| `GET` | `supabase.auth.getSession()` | Resolve active auth session token upon OAuth callback redirect. | [`src/pages/AuthCallback.tsx`](./src/pages/AuthCallback.tsx) |
| `POST` | `supabase.auth.signOut()` | Sign out user session. | [`src/store/index.ts`](./src/store/index.ts) |
| `POST` | `supabase.auth.resetPasswordForEmail()` | Send password reset email link. | [`src/pages/PasswordReset.tsx`](./src/pages/PasswordReset.tsx) |
| `GET` | `SELECT * FROM profiles WHERE id = auth.uid()` | Fetch authenticated user profile & active mode preference. | [`src/store/index.ts`](./src/store/index.ts) |
| `PUT` | `UPDATE profiles SET active_mode_preference = $1` | Switch active app mode between `'seeker'` and `'artisan'`. | [`src/pages/More.tsx`](./src/pages/More.tsx), [`src/store/index.ts`](./src/store/index.ts) |

---

## 2. Artisan Onboarding & KYC Verification

Users upgrade their existing Seeker account to an Artisan account by submitting business details and KYC verification documents.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `POST` | `supabase.storage.from('kyc-documents').upload()` | Upload Government ID, Skill Certificate, and Passport Photo files. | [`src/pages/ArtisanOnboarding.tsx`](./src/pages/ArtisanOnboarding.tsx) |
| `POST` | `SELECT * FROM become_artisan(...)` (RPC) | Upgrade profile: set `is_artisan = true`, `kyc_status = 'approved'`, base rate, callout fee, and business category. | [`src/pages/ArtisanOnboarding.tsx`](./src/pages/ArtisanOnboarding.tsx), [`src/services/supabaseDb.ts`](./src/services/supabaseDb.ts) |
| `GET` | `SELECT kyc_status, is_artisan FROM profiles` | Check if user is an approved artisan before accessing Artisan Dashboard. | [`src/App.tsx`](./src/App.tsx) |

---

## 3. Artisan Profile & Availability Management

Artisans manage their base pricing, weekly schedule, and online status.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `PUT` | `UPDATE profiles SET base_rate = $1, callout_fee = $2` | Update artisan base service rate and commitment callout fee. | [`src/pages/ArtisanDashboard.tsx`](./src/pages/ArtisanDashboard.tsx) |
| `PUT` | `UPDATE profiles SET availability = $1::jsonb` | Update working days and operating hours schedule. | [`src/pages/ArtisanDashboard.tsx`](./src/pages/ArtisanDashboard.tsx) |
| `PUT` | `UPDATE profiles SET is_online = $1` | Toggle online/offline availability switch. | [`src/pages/ArtisanDashboard.tsx`](./src/pages/ArtisanDashboard.tsx) |
| `GET` | `SELECT * FROM profiles WHERE id = :artisanId` | Fetch public artisan profile details, rating, reviews, and schedule. | [`src/pages/ArtisanDetail.tsx`](./src/pages/ArtisanDetail.tsx) |

---

## 4. Artisan Discovery & Search (PostGIS Spatial)

Seekers search for certified artisans by category, search query, and spatial geographic distance radius.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `GET` | `SELECT * FROM get_nearby_artisans(lat, long, radius)` (RPC) | Fetch online artisans within X kilometers of seeker location using PostGIS spatial indexes. | [`src/pages/SeekerHome.tsx`](./src/pages/SeekerHome.tsx), [`src/services/supabaseDb.ts`](./src/services/supabaseDb.ts) |
| `GET` | `SELECT * FROM profiles WHERE is_artisan = true AND category_id = $1` | Filter artisans by service category (Plumbing, Electrical, Carpentry, HVAC, Auto Mechanic, Painting). | [`src/pages/SeekerHome.tsx`](./src/pages/SeekerHome.tsx) |
| `GET` | `SELECT * FROM profiles WHERE full_name ILIKE $1 OR business_name ILIKE $1` | Full-text search for artisans by name or keyword. | [`src/pages/SeekerHome.tsx`](./src/pages/SeekerHome.tsx) |

---

## 5. Direct Booking Pipeline & Escrow Lifecycle

Direct service booking from a seeker to a specific artisan with commitment callout fee escrow lock.

```
Requested ➔ Accepted ➔ Price Proposed ➔ Price Accepted ➔ In Progress ➔ Completed ➔ Funds Released
```

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `POST` | `INSERT INTO bookings (...)` | Seeker creates a direct job request and locks callout fee (`₦3,000`). | [`src/pages/BookingFlow.tsx`](./src/pages/BookingFlow.tsx) |
| `GET` | `SELECT * FROM bookings WHERE seeker_id = $1 OR artisan_id = $1` | Fetch booking list for Seeker or Artisan tabs. | [`src/pages/Requests.tsx`](./src/pages/Requests.tsx), [`src/pages/Bookings.tsx`](./src/pages/Bookings.tsx) |
| `GET` | `SELECT * FROM bookings WHERE id = :bookingId` | Fetch detailed booking timeline and status card. | [`src/pages/BookingFlow.tsx`](./src/pages/BookingFlow.tsx) |
| `PUT` | `UPDATE bookings SET status = 'accepted'` | Artisan accepts direct booking request. | [`src/pages/ArtisanDashboard.tsx`](./src/pages/ArtisanDashboard.tsx) |
| `PUT` | `UPDATE bookings SET status = 'declined'` | Artisan declines booking request. | [`src/pages/ArtisanDashboard.tsx`](./src/pages/ArtisanDashboard.tsx) |
| `PUT` | `UPDATE bookings SET status = 'price_proposed', final_amount = $1` | Artisan submits itemized price breakdown (labor + materials). | [`src/pages/Bookings.tsx`](./src/pages/Bookings.tsx) |
| `PUT` | `UPDATE bookings SET status = 'price_accepted'` | Seeker accepts proposed final price and locks total escrow amount. | [`src/pages/BookingFlow.tsx`](./src/pages/BookingFlow.tsx) |
| `PUT` | `UPDATE bookings SET status = 'completed'` | Mark job as completed and release 95% net payout to artisan's wallet. | [`src/pages/BookingFlow.tsx`](./src/pages/BookingFlow.tsx), [`src/pages/Bookings.tsx`](./src/pages/Bookings.tsx) |
| `POST` | `INSERT INTO disputes (...)` | Raise a dispute on an active job ticket for support review. | [`src/pages/Disputes.tsx`](./src/pages/Disputes.tsx) |

---

## 6. Open Job Marketplace & Bidding System

Seekers post open job tickets for any qualified artisan to place competitive bids.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `POST` | `INSERT INTO marketplace_jobs (...)` | Seeker posts open job ticket (title, description, category, budget, address). | [`src/pages/SeekerHome.tsx`](./src/pages/SeekerHome.tsx) |
| `GET` | `SELECT *, job_proposals(*) FROM marketplace_jobs WHERE status = 'open'` | Fetch open marketplace jobs for artisans to browse and bid on. | [`src/pages/ArtisanDashboard.tsx`](./src/pages/ArtisanDashboard.tsx), [`src/services/supabaseDb.ts`](./src/services/supabaseDb.ts) |
| `POST` | `INSERT INTO job_proposals (...)` | Artisan places a bid (price quote + cover note) on a marketplace job. | [`src/pages/ArtisanDashboard.tsx`](./src/pages/ArtisanDashboard.tsx) |
| `POST` | `UPDATE job_proposals SET status = 'accepted' WHERE id = $1` | Seeker accepts artisan proposal and converts it into a binding booking. | [`src/pages/Requests.tsx`](./src/pages/Requests.tsx) |

---

## 7. Wallet & Payment Transactions

Itemized financial ledger management for booking callout locks, final payments, and withdrawals.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `GET` | `SELECT * FROM wallets WHERE user_id = auth.uid()` | Fetch user ledger balance and currency. | [`src/pages/Wallet.tsx`](./src/pages/Wallet.tsx), [`src/services/supabaseDb.ts`](./src/services/supabaseDb.ts) |
| `GET` | `SELECT * FROM transactions WHERE user_id = auth.uid()` | Fetch itemized credit/debit transaction history. | [`src/pages/Wallet.tsx`](./src/pages/Wallet.tsx) |
| `POST` | `INSERT INTO transactions (type: 'credit', category: 'wallet_topup')` | Fund wallet via Paystack / Flutterwave gateway. | [`src/pages/Wallet.tsx`](./src/pages/Wallet.tsx) |
| `POST` | `INSERT INTO transactions (type: 'debit', category: 'withdrawal')` | Withdraw funds to verified NUBAN bank account. | [`src/pages/Wallet.tsx`](./src/pages/Wallet.tsx) |

---

## 8. Social Media Feed (Discover)

Artisan work showcase feed with stories, hashtags, double-tap likes, and comments.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `GET` | `SELECT *, post_comments(*) FROM artisan_posts` | Fetch showcase posts feed sorted by newest. | [`src/pages/Discover.tsx`](./src/pages/Discover.tsx), [`src/services/supabaseDb.ts`](./src/services/supabaseDb.ts) |
| `POST` | `supabase.storage.from('showcase-images').upload()` | Upload work photo image file. | [`src/pages/Discover.tsx`](./src/pages/Discover.tsx) |
| `POST` | `INSERT INTO artisan_posts (...)` | Artisan publishes new work showcase post. | [`src/pages/Discover.tsx`](./src/pages/Discover.tsx) |
| `POST` | `INSERT INTO post_likes (...)` | Like/unlike a showcase post (toggles heart count). | [`src/pages/Discover.tsx`](./src/pages/Discover.tsx) |
| `POST` | `INSERT INTO post_comments (...)` | Post a comment on a showcase post. | [`src/pages/Discover.tsx`](./src/pages/Discover.tsx) |

---

## 9. In-App Chat & Realtime Messaging

Direct messaging between seeker and artisan during active job bookings.

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `GET` | `SELECT * FROM chat_messages WHERE booking_id = $1` | Fetch message history for a booking conversation. | [`src/pages/Chat.tsx`](./src/pages/Chat.tsx) |
| `POST` | `INSERT INTO chat_messages (...)` | Send text message or image attachment in chat. | [`src/pages/Chat.tsx`](./src/pages/Chat.tsx) |
| `WS` | `supabase.channel('chat_messages').on('postgres_changes')` | Realtime WebSocket channel for instant message delivery without polling. | [`src/pages/Chat.tsx`](./src/pages/Chat.tsx) |

---

## 10. Notifications & Customer Support

| Method | Endpoint / Table Operation | Description | Frontend Invocation Site |
|---|---|---|---|
| `GET` | `SELECT * FROM notifications WHERE user_id = auth.uid()` | Fetch in-app push notifications and unread badges. | [`src/components/AppHeader.tsx`](./src/components/AppHeader.tsx) |
| `PUT` | `UPDATE notifications SET read = true WHERE user_id = auth.uid()` | Mark notifications as read. | [`src/components/AppHeader.tsx`](./src/components/AppHeader.tsx) |
| `POST` | `INSERT INTO support_tickets (...)` | Send customer service inquiry ticket. | [`src/pages/Help.tsx`](./src/pages/Help.tsx) |
