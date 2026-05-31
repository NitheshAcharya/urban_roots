# UrbanRoots — Project Report

> **Grow Green in the City**
>
> A comprehensive urban gardening platform for home gardeners in Karnataka, India — powered by AI, real-time IoT simulation, and community-driven knowledge.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Module Descriptions](#6-module-descriptions)
   - 6.1 [Smart Grow Dashboard](#61-smart-grow-dashboard)
   - 6.2 [Plant Encyclopedia](#62-plant-encyclopedia)
   - 6.3 [Plant Details & Photo Journal](#63-plant-details--photo-journal)
   - 6.4 [AI-Powered Plant Tools](#64-ai-powered-plant-tools)
   - 6.5 [Marketplace](#65-marketplace)
   - 6.6 [Expert Consultation Booking](#66-expert-consultation-booking)
   - 6.7 [Community Forum](#67-community-forum)
   - 6.8 [Nursery Finder](#68-nursery-finder)
   - 6.9 [Yield Calculator](#69-yield-calculator)
   - 6.10 [Planting Calendar](#610-planting-calendar)
   - 6.11 [User Profile & Authentication](#611-user-profile--authentication)
   - 6.12 [Admin Panel](#612-admin-panel)
   - 6.13 [Chatbot Widget](#613-chatbot-widget)
   - 6.14 [Onboarding Wizard](#614-onboarding-wizard)
7. [Database Design](#7-database-design)
8. [Backend API Reference](#8-backend-api-reference)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [State Management](#10-state-management)
11. [Design System & UI/UX](#11-design-system--uiux)
12. [Security](#12-security)
13. [Future Enhancements](#13-future-enhancements)
14. [Conclusion](#14-conclusion)

---

## 1. Introduction

**UrbanRoots** is a full-stack Progressive Web Application (PWA) designed to empower urban home gardeners in Karnataka, India. The platform combines modern web technologies — React, Supabase, and Google Gemini AI — to deliver a comprehensive gardening companion that covers every aspect of the urban farming lifecycle, from planting and monitoring to diagnosis, shopping, and community engagement.

The application is specifically tailored to the climatic conditions, crop varieties, and agricultural practices of Karnataka's diverse zones, including Bengaluru Urban, Coastal Karnataka, Dry Plains, and the Malnad/Western Ghats region. With a strong emphasis on sustainable agriculture techniques such as hydroponics, vertical farming, and water conservation, UrbanRoots positions itself as a next-generation digital solution for the growing urban farming movement.

---

## 2. Problem Statement

Urban residents who wish to grow their own food face several challenges:

- **Limited Space**: Apartments and small homes offer minimal gardening area, requiring space-efficient solutions like vertical towers and hydroponic systems.
- **Lack of Knowledge**: New gardeners lack expertise in crop selection, disease identification, watering schedules, and soil management.
- **Regional Mismatch**: Most gardening resources are generic and do not account for Karnataka's specific climate zones, monsoon patterns, and local crop suitability.
- **Fragmented Tools**: Gardeners must juggle multiple apps and websites for plant care, shopping, expert advice, and community interaction.
- **No Real-Time Monitoring**: Home growers have no access to IoT-style monitoring dashboards that commercial farms use to track environmental conditions.

UrbanRoots addresses these challenges by providing an all-in-one platform with AI-powered diagnostics, region-specific calendars, simulated IoT dashboards, and an integrated marketplace.

---

## 3. Objectives

| # | Objective |
|---|-----------|
| 1 | Develop a responsive, PWA-capable web application for urban gardeners in Karnataka |
| 2 | Integrate Google Gemini AI for plant disease diagnosis, species identification, and soil analysis via image recognition |
| 3 | Provide a comprehensive plant encyclopedia with hydroponics, vertical farming, and water-saving parameters |
| 4 | Simulate real-time IoT telemetry (pH, EC, temperature, humidity, light) for hydroponic and vertical farming systems |
| 5 | Build a region-specific planting calendar covering 4 Karnataka climate zones and 3 growing methods |
| 6 | Create a community platform with real-time post feeds, likes, comments, and content moderation |
| 7 | Enable expert consultation booking with Karnataka-based agricultural specialists |
| 8 | Implement a marketplace for gardening supplies with cart management and checkout |
| 9 | Automate daily watering reminder emails using cron-based scheduling |
| 10 | Ensure data persistence, user authentication, and row-level security through Supabase |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React 19 + Vite 8 SPA (PWA)              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐  │  │
│  │  │  Pages   │ │Components│ │  Context   │ │  Data  │  │  │
│  │  │ (14 pgs) │ │ (7 comp) │ │(Auth/Cart/ │ │(Plants)│  │  │
│  │  │          │ │          │ │  Theme)    │ │        │  │  │
│  │  └──────────┘ └──────────┘ └───────────┘ └────────┘  │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │ HTTP / REST                       │
└──────────────────────────┼──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Express.js │  │   Supabase   │  │  External    │
│   Backend    │  │   (BaaS)     │  │  APIs        │
│              │  │              │  │              │
│ • Gemini AI  │  │ • PostgreSQL │  │ • Open-Meteo │
│ • Resend     │  │ • Auth       │  │ • Google Maps│
│ • Razorpay*  │  │ • Storage    │  │              │
│ • Cron Jobs  │  │ • Realtime   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘

* Razorpay integration is paused (endpoints commented out)
```

### Data Flow

1. **User Authentication** flows through Supabase Auth (email/password + Google OAuth).
2. **CRUD Operations** (plants, posts, bookings, orders) interact directly with Supabase from the client using the JS SDK and Row Level Security (RLS) policies.
3. **AI Operations** (image analysis, chat) route through the Express backend, which proxies requests to the Google Gemini API.
4. **Email Notifications** are sent via the Resend API from the backend, triggered by a daily cron job.
5. **Real-time Updates** (community feed) use Supabase Realtime channels for live data synchronization.

---

## 5. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI framework (component-based SPA) |
| Vite | 8.0.1 | Build tool and dev server (HMR) |
| React Router DOM | 7.13.1 | Client-side routing (14 routes) |
| Lucide React | 0.577.0 | Icon library (SVG icons) |
| @supabase/supabase-js | 2.99.3 | Supabase client SDK |
| @react-google-maps/api | 2.20.8 | Google Maps integration |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js + Express | 4.18.2 | REST API server |
| @supabase/supabase-js | 2.39.0 | Server-side Supabase client |
| Razorpay SDK | 2.9.2 | Payment gateway (paused) |
| Resend | 3.0.0 | Transactional email service |
| node-cron | 3.0.3 | Scheduled task runner |
| dotenv | 16.3.1 | Environment variable management |
| CORS | 2.8.5 | Cross-origin resource sharing |

### Cloud Services

| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database, authentication, file storage, real-time subscriptions |
| Google Gemini 2.5 Flash Lite | AI vision (plant/soil analysis) + language model (chat) |
| Resend | Transactional email delivery |
| Open-Meteo | Free weather API (no key required) |
| Google Maps Platform | Maps embed + Places API for nursery finder |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9.39.4 | Code linting with React Hooks and React Refresh plugins |
| Google Fonts (Outfit, Inter) | Typography |
| Service Worker (sw.js) | PWA offline capabilities |

---

## 6. Module Descriptions

### 6.1 Smart Grow Dashboard

**File**: `src/pages/Dashboard.jsx` (631 lines)

The Dashboard serves as the primary landing page and control center for the application. It presents a Smart Grow Dashboard interface that simulates an IoT-enabled monitoring system for urban farming setups.

**Key Features**:

| Feature | Description |
|---------|-------------|
| **Weather Widget** | Fetches live weather data from the Open-Meteo API (latitude: 12.9716, longitude: 77.5946 — Bangalore). Displays current temperature (°C), relative humidity (%), and wind speed (km/h). |
| **IoT Telemetry Simulator** | Simulates real-time sensor readings for pH level, EC conductivity (mS/cm), ambient temperature, humidity, and light intensity (lux). Data fluctuates every 4 seconds using sinusoidal math functions. Includes SVG sparkline charts tracking the last 20 data points for pH and EC. |
| **Eco-Savings HUD** | Computes environmental impact metrics: water saved (liters), space optimization multiplier (up to 8× for vertical towers), eco-score rating (A+/A/B), and CO₂ offset based on the user's active plants and growing methods. |
| **Maintenance Reminders** | Dynamic watering schedule calculated from `last_watered` + `watering_frequency_days` stored in Supabase. Status indicators: Urgent (overdue), Due (today), Done (recently watered). Falls back to mock data when offline. |
| **My Plants Grid** | Displays user's registered plants as cards showing health status (color-coded bar: green/orange/red), grow method tags (Hydroponics, Vertical, Soil), and a quick "Water Now" action button. |
| **Add Plant Form** | Inline deployment form to register new plants with species selection, grow method (Hydroponics NFT, Hydroponics DWC, Vertical Grow Tower, Soil Container), and watering frequency. Persists to Supabase `user_plants` table. |
| **Quick Actions** | 7 navigation cards linking to Encyclopedia, Yield Calculator, Plant Calendar, AI Doctor, Market, Experts, and Community modules. |

---

### 6.2 Plant Encyclopedia

**File**: `src/pages/Encyclopedia.jsx` (358 lines)

A searchable, filterable catalog of plants suitable for urban cultivation in Karnataka.

**Key Features**:

- **Search with Autocomplete**: Live fuzzy search across plant name, scientific name, and description. Displays top 5 suggestions in a dropdown popover with click-outside dismissal.
- **Dual Filter System**:
  - *Category Pills*: Vegetables, Herbs, Flowers, Fruits, Indoor, Medicinal
  - *Growing Method Pills*: Hydroponics Suitable, Vertical Towers, Water-Saving 90%+
- **Plant Cards**: Each card displays the plant image, water savings percentage badge, difficulty indicator, suitability tags, key metrics (irrigation loop, sunlight hours, yield cycle), and growing medium.
- **Community Corrections**: A "Suggest Correction" modal allows users to submit parameter corrections for any plant entry, including the field name, corrected value, and verification source. Suggestions are saved to the `plant_suggestions` table for admin review.
- **Loading Skeletons**: Shimmer placeholder animations for 8 card positions while data loads.

**Data Source**: Local static dataset (`plantsData.js` — 246 KB) containing comprehensive growing parameters for dozens of crop varieties.

---

### 6.3 Plant Details & Photo Journal

**File**: `src/pages/PlantDetails.jsx` (536 lines)

A deep-dive page for individual plant species with 6 tabbed content sections.

| Tab | Content |
|-----|---------|
| **General Care** | Crop biography, irrigation requirements, sunlight hours, yield cycle, expert tips, planting season, common pests, substrate/soil info |
| **Hydroponics** | Recommended system (DWC/NFT), optimal pH range, EC conductivity strength, setup instructions, nutrient requirements |
| **Vertical Setup** | Vertical system type, pocket spacing, density layout, setup instructions, lighting rotation tips |
| **Water Saving** | Water savings percentage showcase, specific optimization strategies |
| **Progress & Varieties** | Weekly growth phases timeline (4 phases with images), plant varieties/genetics cards |
| **Photo Journal** | User-uploaded progress photos (stored in Supabase Storage `grow_logs` bucket) with notes and timestamps. Displays as a visual growth timeline. Only visible if the user has the plant in their collection. |

---

### 6.4 AI-Powered Plant Tools

**File**: `src/pages/AITools.jsx` (518 lines)

A ChatGPT-style conversational interface powered by Google Gemini 2.5 Flash Lite for image-based plant analysis.

**Three Analysis Modes**:

| Mode | Input | Output |
|------|-------|--------|
| **Disease Diagnosis** | Photo of affected plant | Disease name, severity badge, confidence percentage, treatment plan, prevention tips, links to Marketplace & Experts |
| **Plant Identification** | Photo of unknown plant | Species name, botanical family, care level, biological description, care tips, links to Encyclopedia & Marketplace |
| **Soil Analysis** | Photo of soil sample | Soil type classification, pH estimate, texture analysis, NPK nutrient grid (Nitrogen/Phosphorus/Potassium), amendment recommendations |

**Additional Features**:
- Full chat conversation history with user/AI message bubbles
- Free-form text questions about plant care
- Sidebar with recent scan history and model status indicator
- Chat history persistence via backend API
- Scan results logged to Supabase `ai_scans` table

---

### 6.5 Marketplace

**File**: `src/pages/Marketplace.jsx` (261 lines) + `src/pages/Checkout.jsx` (159 lines)

An Amazon-style e-commerce interface for gardening supplies.

**Marketplace Features**:
- 9 curated products: seeds, fertilizers, soil mixes, pots, and tools — all with INR pricing, discount percentages, star ratings, review counts, and badges (Best Seller, Deal of the Day, Organic, Limited Stock, Top Brand).
- Left sidebar filters: Category, Customer Reviews (4★+/3★+/2★+), Price Range (Under ₹200 / ₹200–500 / Over ₹500).
- Product detail modal with deal pricing, description, shipping info ("FREE Delivery tomorrow"), and return policy.
- Full cart integration via `CartContext`.

**Checkout Features**:
- Order summary with line items, quantities, and prices.
- Coupon codes: `URBAN10` (10% discount), `FREESHIP` (₹50 off shipping).
- ₹50 flat shipping fee with subtotal, discount, and total calculation.
- Mock payment form (card details) with 2-second simulated processing.
- Success confirmation state with cart clearing.

> **Note**: Razorpay payment gateway integration exists in the backend but is currently paused (endpoints commented out). The frontend uses simulated payment processing.

---

### 6.6 Expert Consultation Booking

**File**: `src/pages/Experts.jsx` (189 lines)

A consultation booking platform connecting users with Karnataka-based agricultural specialists.

**Expert Panel**:

| Expert | Specialization | Location | Rate |
|--------|---------------|----------|------|
| Plant Pathologist | Disease Diagnosis | Bengaluru | ₹499/session |
| Urban Farming Specialist | Setup & Design | Mysuru | ₹699/session |
| Soil Scientist | Soil Testing | Mangaluru | ₹399/session |
| Horticulturist | General Gardening | Hubballi | ₹299/session |

**Booking Flow**:
1. Filter experts by category (All, Disease Diagnosis, Setup & Design, Soil Testing, Online Only)
2. Select an expert and open the booking modal
3. Choose date, time slot, consultation type (Online Video Call / Home Visit)
4. Describe the problem
5. Confirm booking → saved to Supabase `bookings` table + confirmation email sent via Resend

---

### 6.7 Community Forum

**File**: `src/pages/Community.jsx` (537 lines)

A YouTube/Reddit-style social feed for urban gardeners with real-time updates.

**Key Features**:
- **Post Types**: Tips (💡), Questions (❓), Showcases (📸)
- **Post Composer**: Expandable composer with type selector, auto-focus, author info from profile
- **Engagement Toolbar**: Like/Dislike toggle buttons with persistent counts (Supabase `post_likes` table with `user_id, post_id` unique constraint)
- **Comments System**: Expandable per-post comment section with Enter-key submission
- **Real-time Sync**: Supabase Realtime channel subscriptions on `community_posts`, `community_comments`, and `post_likes` tables — the feed auto-refreshes on any database change
- **Filter Pills**: All Posts, Tips, Questions, Showcases
- **Fallback**: 3 mock posts displayed when Supabase is unavailable

---

### 6.8 Nursery Finder

**File**: `src/pages/Nurseries.jsx` (276 lines)

A Google Maps-powered local nursery discovery tool.

**Key Features**:
- Split layout: left sidebar with nursery listings + right panel with Google Maps embed
- 3 featured nurseries in Bengaluru with ratings, review counts, distance, open/close status, descriptions, addresses, phone numbers, and website links
- Browser Geolocation API integration to center the map on the user's actual location (fallback: general Bengaluru view)
- Google Maps iframe: `maps.google.com/maps?q=plant+nursery+near+{lat},{lng}`
- Detail overlay with image gallery, contact info, and quick action buttons (Website, Directions, Call)
- "Start Navigation" link opens Google Maps turn-by-turn directions

---

### 6.9 Yield Calculator

**File**: `src/pages/YieldCalculator.jsx` (282 lines)

An interactive impact simulator for urban farming setups.

**Input Parameters**:

| Parameter | Range |
|-----------|-------|
| Growing System | Soil / DWC Hydroponics / NFT Hydroponics / Vertical Tower |
| Available Space | 1–50 m² (slider) |
| Harvest Cycles/Year | 1–8 (slider) |
| Crop Selection | Up to 3 crops (from filtered `plantsData`) |

**Calculated Outputs**:

| Metric | Formula Basis |
|--------|---------------|
| Food Harvested | kg/year based on space × plants/m² × cycles |
| Water Conserved | Liters saved vs. traditional farming |
| Space Efficiency | 1×–8× multiplier (Vertical Tower = 8×) |
| CO₂ Offset | kg/year based on food production |
| Grocery Savings | ₹/year at ₹150/kg average |
| Eco-Score | A+ / A / B / C (SVG radial progress ring) |

**Sharing**: "Share to Twitter" button generates a tweet with calculated stats and opens a Twitter intent URL.

---

### 6.10 Planting Calendar

**File**: `src/pages/PlantingCalendar.jsx` (538 lines)

A South India region-specific planting schedule with sow/grow/harvest timelines.

**Climate Zones**:

| Zone | Characteristics |
|------|----------------|
| Bengaluru Urban | Moderate temperatures, year-round growing potential |
| Coastal Karnataka | Hot & humid, monsoon-heavy, post-monsoon sowing recommended |
| Dry Plains | Arid conditions, limited summer growing for leafy greens |
| Malnad / Western Ghats | Hilly & wet, extended monsoon season |

**Features**:
- Growing method toggle (Soil / Hydroponics / Vertical) — Hydro and Vertical methods extend growing windows by 1 month
- 12-month schedule grid with color-coded cells: Sow (green), Grow (yellow), Harvest (orange)
- Month detail panel with sowing/growing/harvesting crop counts, zone climate advisory, and system-specific guidelines
- Category and text search filters
- Print/PDF export support with `.no-print` class exclusions

---

### 6.11 User Profile & Authentication

**Files**: `src/pages/Auth.jsx` (219 lines), `src/pages/Profile.jsx` (354 lines)

**Authentication Page**:
- Split layout: left branding panel with feature highlights + right form panel
- Login/Signup tab toggle
- Email/password authentication via Supabase Auth
- Google OAuth sign-in with redirect to app origin
- Signup includes full name and city selection (Karnataka cities dropdown)
- Password visibility toggle and inline error/success feedback

**Profile Page**:
- Profile header with avatar (uploadable to Supabase Storage `avatars` bucket), name, city, and join date
- Edit mode: change name, city, avatar, and toggle email notification preferences
- Stats dashboard: plants count, bookings count, community posts count (all queried from Supabase)
- My Plants quick view (first 4 plants)
- Purchase history from `orders` table
- Recent bookings from `bookings` table with status badges
- Sign-out functionality

---

### 6.12 Admin Panel

**File**: `src/pages/Admin.jsx` (113 lines)

A management dashboard for reviewing community-submitted encyclopedia corrections.

- Displays all pending suggestions in a table format (plant name, field, suggested value, reason, status)
- Approve/Reject action buttons that update the `plant_suggestions` table status
- Mock fallback data when Supabase is unavailable

---

### 6.13 Chatbot Widget

**File**: `src/components/ChatBot.jsx` (169 lines)

A floating chatbot available on every page of the application.

- Green 🌿 FAB button in the bottom-right corner toggles a slide-up chat panel
- Sends messages to the backend `/api/chat` endpoint (Gemini AI) with the last 6 messages as conversation context
- Smart fallback: when the backend is unavailable, matches keywords (water, sunlight, pest, soil, monsoon, tomato, tulsi) and returns hardcoded Karnataka-specific gardening advice
- Chat conversations are logged to Supabase `chat_history` table
- Animated typing indicator while awaiting AI response

---

### 6.14 Onboarding Wizard

**File**: `src/components/OnboardingModal.jsx` (139 lines)

A first-time user onboarding experience with a 4-step wizard.

| Step | Content |
|------|---------|
| 1 | City input (Karnataka location) |
| 2 | Space type selection: Balcony, Terrace, Window, Indoor, or Garden |
| 3 | Pick 3 starter plants: Tomato, Tulsi, Aloe Vera, Mint, Money Plant, Rose |
| 4 | Success screen — "You're all set!" |

- Animated progress bar based on current step
- Persisted via `localStorage` key `urbanroots_onboarded` to prevent re-showing
- Auto-triggers 500ms after initial mount for new users

---

## 7. Database Design

The application uses **Supabase (PostgreSQL)** with 12 tables and 2 storage buckets. All tables have Row Level Security (RLS) enabled.

### Entity-Relationship Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   profiles   │────<│  user_plants │────<│ plant_growth_logs │
│   (users)    │     │              │     │   (photo journal) │
└──────┬───────┘     └──────────────┘     └──────────────────┘
       │
       ├────<┌──────────────┐
       │     │    orders    │
       │     │  (purchases) │
       │     └──────────────┘
       │
       ├────<┌──────────────┐
       │     │   bookings   │
       │     │   (experts)  │
       │     └──────────────┘
       │
       ├────<┌──────────────┐     ┌────────────────────┐
       │     │community_    │────<│ community_comments │
       │     │   posts      │     └────────────────────┘
       │     └──────┬───────┘
       │            │
       │            └────<┌──────────────┐
       │                  │  post_likes  │
       │                  └──────────────┘
       │
       ├────<┌──────────────┐
       │     │   ai_scans   │
       │     └──────────────┘
       │
       ├────<┌──────────────┐
       │     │ chat_history │
       │     └──────────────┘
       │
       └────<┌────────────────────┐
             │ push_subscriptions │
             └────────────────────┘

┌──────────────────┐
│ plant_suggestions │  (standalone — not user-linked)
└──────────────────┘
```

### Table Definitions

| # | Table | Primary Key | Foreign Keys | Purpose |
|---|-------|-------------|--------------|---------|
| 1 | `profiles` | `id` (UUID → auth.users) | — | User profile data (name, email, city, avatar, notification prefs) |
| 2 | `user_plants` | `id` (UUID) | `user_id` → profiles | Registered plants with species, watering frequency, health status, grow method |
| 3 | `orders` | `id` (UUID) | `user_id` → profiles | Marketplace purchase records with Razorpay IDs, amounts, shipping address |
| 4 | `bookings` | `id` (UUID) | `user_id` → profiles | Expert consultation bookings with date, time, type, and problem description |
| 5 | `plant_suggestions` | `id` (UUID) | — | Community-submitted encyclopedia corrections (plant, field, value, reason) |
| 6 | `ai_scans` | `id` (UUID) | `user_id` → profiles | AI analysis results stored as JSONB (disease/identify/soil mode) |
| 7 | `chat_history` | `id` (UUID) | `user_id` → profiles | Chatbot conversation logs (user message + bot response) |
| 8 | `community_posts` | `id` (UUID) | `user_id` → profiles | Community feed posts (type: tip/question/showcase, content, tags) |
| 9 | `community_comments` | `id` (UUID) | `post_id` → community_posts, `user_id` → profiles | Comments on community posts |
| 10 | `post_likes` | `id` (UUID) | `user_id` → profiles, `post_id` → community_posts | Like/dislike records (unique per user per post) |
| 11 | `plant_growth_logs` | `id` (UUID) | `plant_id` → user_plants, `user_id` → profiles | Photo journal entries with image URL, notes, and date |
| 12 | `push_subscriptions` | `id` (UUID) | `user_id` → profiles | Web push notification subscription JSON (unique per user) |

### Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `grow_logs` | Plant growth progress photos uploaded from Photo Journal |
| `avatars` | User profile picture uploads |

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following policy patterns:

- **User-owned data** (plants, orders, bookings, growth logs, push subscriptions): Users can only access their own records (`auth.uid() = user_id`).
- **Public-read data** (community posts, comments, likes, suggestions, scans, chat history): Anyone can read; only authenticated owners can create/update/delete.
- **Profiles**: Users can select, update, and delete only their own profile. Anyone can insert (for initial signup).

---

## 8. Backend API Reference

**Server**: Express.js running on port 3000 (configurable via `PORT` env var)

### Active Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/api/chat` | AI chat — plant Q&A | `{ message, history[], userId? }` | `{ reply }` |
| `GET` | `/api/chat-history/:userId` | Fetch user's chat logs | — | `{ data: [{user_message, bot_response, created_at}] }` |
| `POST` | `/api/analyze-plant` | AI vision analysis | `{ image (base64), mode }` | `{ result: {structured JSON} }` |
| `POST` | `/api/plants` | Create a user plant | `{ user_id, plant_name, species, ... }` | `{ data }` |
| `PATCH` | `/api/plants/:id/water` | Mark plant as watered | — | `{ data }` |
| `DELETE` | `/api/plants/:id` | Remove a plant | — | `{ success }` |
| `POST` | `/api/push/subscribe` | Save push subscription | `{ userId, subscription }` | `{ success }` |
| `POST` | `/api/book-expert` | Book expert consultation | `{ user_id, expert_name, ... }` | `{ data }` + email |
| `GET` | `/api/health` | Health check | — | `{ status: 'ok' }` |

### Paused Endpoints (Razorpay)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/create-order` | Create Razorpay payment order |
| `POST` | `/api/verify-payment` | Verify Razorpay payment signature (HMAC SHA256) |

### Cron Jobs

| Schedule | Job | Description |
|----------|-----|-------------|
| `0 7 * * *` (Daily at 7:00 AM) | Watering Reminder Emails | Queries `user_plants` joined with `profiles`. Identifies plants where `last_watered + watering_frequency_days ≤ today`. Groups overdue plants by user email. Sends styled HTML reminder emails via Resend to users with `email_notifications_enabled = true`. |

---

## 9. Third-Party Integrations

| Service | Usage | Configuration |
|---------|-------|---------------|
| **Supabase** | Database (PostgreSQL), Authentication (email/password + Google OAuth), File Storage (avatars, grow_logs), Realtime subscriptions (community feed) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **Google Gemini 2.5 Flash Lite** | AI Vision (plant disease diagnosis, species identification, soil analysis from images), Language Model (conversational plant care Q&A) | `GEMINI_API_KEY` (backend) |
| **Resend** | Transactional email delivery for watering reminders and booking confirmations | `RESEND_API_KEY` (backend) |
| **Open-Meteo** | Free weather API — current temperature, humidity, wind speed for Bangalore | No API key required |
| **Google Maps Platform** | Maps embed for nursery finder, Places API, Geolocation | `VITE_GOOGLE_MAPS_API_KEY` |
| **Razorpay** | Payment gateway for marketplace orders (currently paused) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (backend) |

---

## 10. State Management

The application uses React Context API for global state management across three providers:

### AuthContext

- Manages user session lifecycle via `supabase.auth.getSession()` and `onAuthStateChange` listener
- Auto-creates a `profiles` row on first login if one doesn't exist (handles PGRST116 error)
- Syncs OAuth metadata (Google profile picture, display name) to the profile
- Exposes: `user`, `profile`, `loading`, `signUp()`, `signIn()`, `signOut()`, `isAuthenticated`

### CartContext

- Shopping cart state with `localStorage` persistence (`urbanroots_cart` key)
- Exposes: `addToCart()`, `removeFromCart()`, `updateQuantity()`, `clearCart()`, `cartTotal`, `cartCount`, `isCartOpen`
- Auto-opens cart drawer when a new item is added
- Quantity management with auto-removal at zero

### ThemeContext

- Light/dark theme toggle with `localStorage` persistence (`urbanroots_theme` key)
- Detects system preference via `prefers-color-scheme: dark` media query on initial load
- Sets `data-theme` attribute on `<html>` element, which triggers CSS variable overrides

---

## 11. Design System & UI/UX

### Typography

| Role | Font | Source |
|------|------|--------|
| Headings | Outfit | Google Fonts |
| Body | Inter | Google Fonts |

### Color Palette

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Background | `#f7f6f0` (warm white) | `#060b06` (near-black green) |
| Card Background | `#ffffff` | `#0c120c` |
| Primary | `#2ecc71` (green) | `#2ecc71` |
| Accent Blue | `#2d9cdb` | `#00d2ff` |
| Accent Red | `#e74c3c` | `#e74c3c` |
| Accent Yellow | `#f39c12` | `#f39c12` |

### Design Patterns

- **Glass-morphism**: `.glass-card` class — semi-transparent background, `blur(16px)` backdrop filter, subtle border, box shadow. Hover state lifts card and highlights border green.
- **Animations**: `fade-in-bottom` keyframe (opacity 0→1 + translateY 12→0), `shimmer` keyframe for loading skeletons, page transitions via `.page-transition` class.
- **Buttons**: `.btn-primary` — green gradient with glow shadow, hover lifts and scales. `.btn-secondary` — outlined green variant.
- **Toast Notifications**: Fixed bottom-center with green border glow.
- **Border Radii**: sm (8px), md (16px), lg (24px), full (9999px).
- **Responsive Design**: Mobile bottom navigation bar, hamburger menu drawer, responsive grid layouts.

---

## 12. Security

| Measure | Implementation |
|---------|---------------|
| **Row Level Security (RLS)** | All 12 Supabase tables have RLS enabled. Policies enforce that users can only access their own data for sensitive tables (plants, orders, bookings, growth logs). |
| **Authentication** | Supabase Auth with email/password and Google OAuth. JWT-based session management. |
| **Environment Variables** | Sensitive keys (Supabase, Gemini, Resend, Razorpay, Google Maps) stored in `.env` files, excluded from version control via `.gitignore`. |
| **CORS** | Backend Express server uses `cors()` middleware to control cross-origin requests. |
| **Payment Verification** | Razorpay signature verification uses HMAC SHA256 to prevent tampering (currently paused). |
| **Input Validation** | AI analysis endpoints include prompt instructions to reject non-plant images. |

---

## 13. Future Enhancements

| # | Enhancement | Description |
|---|-------------|-------------|
| 1 | **Live Razorpay Payments** | Reactivate the commented-out Razorpay endpoints to enable real payment processing for marketplace orders. |
| 2 | **Real IoT Integration** | Replace the simulated telemetry with actual sensor data from ESP32/Arduino-based hydroponic monitoring systems via MQTT or WebSocket. |
| 3 | **Push Notifications** | Implement Web Push API using the existing `push_subscriptions` table infrastructure to deliver browser-native watering reminders. |
| 4 | **Multi-Language Support** | Add Kannada (ಕನ್ನಡ) and Hindi (हिन्दी) localization for broader Karnataka user accessibility. |
| 5 | **Plant Disease Model Fine-Tuning** | Fine-tune the Gemini vision model on Karnataka-specific crop diseases for higher diagnostic accuracy. |
| 6 | **Social Image Sharing** | Enable image uploads in community posts (currently text-only) for plant showcases. |
| 7 | **Order Tracking** | Add real-time order tracking with delivery status updates for marketplace purchases. |
| 8 | **Gamification** | Introduce achievement badges, XP points, and leaderboards to incentivize consistent plant care and community participation. |

---

## 14. Conclusion

UrbanRoots is a feature-rich, full-stack Progressive Web Application that addresses the growing demand for accessible urban gardening tools in Karnataka, India. By combining a modern React frontend with Supabase backend services and Google Gemini AI capabilities, the platform provides an integrated experience spanning plant monitoring, AI-powered diagnostics, community engagement, e-commerce, and expert consultations.

The application demonstrates effective use of contemporary web technologies including React 19, Vite 8, Supabase Realtime, and the Gemini 2.5 Flash Lite vision/language model. With its region-specific planting calendar, Karnataka-focused expert network, and localized content, UrbanRoots is uniquely positioned to serve the Indian urban farming community.

The modular architecture, comprehensive database design with Row Level Security, and clean separation of concerns between frontend and backend ensure that the platform is maintainable, scalable, and ready for production deployment with the activation of payment processing and real IoT sensor integration.

---

> **Project**: UrbanRoots — Grow Green in the City
> **Platform**: Progressive Web Application (PWA)
> **Stack**: React 19 + Vite 8 | Express.js | Supabase | Google Gemini AI
> **Target Region**: Karnataka, India
> **Date**: May 2026
