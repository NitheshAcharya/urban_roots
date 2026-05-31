# UrbanRoots — Project Report

> **Grow Green in the City**
>
> A comprehensive urban gardening platform for home gardeners in Karnataka, India — powered by AI, real-time IoT simulation, gamification, community-driven barter exchange, and beginner-friendly cultivation guides.

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
   - 6.3 [Plant Details & Beginner Grow Guides](#63-plant-details--beginner-grow-guides)
   - 6.4 [AI-Powered Plant Tools](#64-ai-powered-plant-tools)
   - 6.5 [Marketplace & P2P Barter Hub](#65-marketplace--p2p-barter-hub)
   - 6.6 [Expert Consultation Booking](#66-expert-consultation-booking)
   - 6.7 [Community Forum](#67-community-forum)
   - 6.8 [Nursery Finder](#68-nursery-finder)
   - 6.9 [Yield & Water Savings Simulator](#69-yield--water-savings-simulator)
   - 6.10 [Planting Calendar](#610-planting-calendar)
   - 6.11 [User Profile & Authentication](#611-user-profile--authentication)
   - 6.12 [Admin Panel](#612-admin-panel)
   - 6.13 [Chatbot Widget](#613-chatbot-widget)
   - 6.14 [Onboarding Wizard](#614-onboarding-wizard)
   - 6.15 [Gamification Engine](#615-gamification-engine)
7. [Database Design](#7-database-design)
8. [Backend API Reference](#8-backend-api-reference)
9. [Third-Party Integrations](#9-third-party-integrations)
10. [State Management](#10-state-management)
11. [Design System & UI/UX](#11-design-system--uiux)
12. [Security](#12-security)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Future Enhancements](#14-future-enhancements)
15. [Conclusion](#15-conclusion)

---

## 1. Introduction

**UrbanRoots** is a full-stack Progressive Web Application (PWA) designed to empower urban home gardeners in Karnataka, India. The platform combines modern web technologies — React 19, Supabase, Vercel Serverless Functions, and Google Gemini AI — to deliver a comprehensive gardening companion that covers every aspect of the urban farming lifecycle, from planting and monitoring to AI-powered diagnosis, recipe generation, community barter exchange, and expert consultations.

The application is specifically tailored to the climatic conditions, crop varieties, and agricultural practices of Karnataka's diverse zones, including Bengaluru Urban, Coastal Karnataka, Dry Plains, and the Malnad/Western Ghats region. With a strong emphasis on sustainable agriculture techniques such as hydroponics, vertical farming, and water conservation, UrbanRoots positions itself as a next-generation digital solution for the growing urban farming movement.

**Key Differentiators:**
- **Hyper-local Community Exchange**: A P2P Barter & Seed Swap Hub transforms the platform from a purely commercial tool into a community-driven local micro-economy for Karnataka gardeners.
- **AI-Powered Recipe Generator**: Integrates harvest-to-table intelligence, generating South Indian/Karnataka-style recipes from the user's active garden crops using Google Gemini AI.
- **Beginner-Friendly Grow Guides**: Step-by-step cultivation instructions for 9 key Karnataka crops — covering seedling care, disease eradication, fertilizer schedules, hydroponics setup, and vertical farming — designed for first-time gardeners.
- **Dynamic GPS-Based Weather**: Live weather data fetched based on the user's real GPS coordinates with reverse geocoding, supporting all major Karnataka cities.
- **Gamification & Digital Badges**: An XP-based leveling system with streaks, digital achievement badges, and social sharing to encourage consistent plant care and community engagement.

---

## 2. Problem Statement

Urban residents who wish to grow their own food face several challenges:

- **Limited Space**: Apartments and small homes offer minimal gardening area, requiring space-efficient solutions like vertical towers and hydroponic systems.
- **Lack of Knowledge**: New gardeners lack expertise in crop selection, disease identification, watering schedules, fertilizer application, and soil management. Most resources assume prior experience and do not provide step-by-step beginner guidance.
- **Regional Mismatch**: Most gardening resources are generic and do not account for Karnataka's specific climate zones, monsoon patterns, local crop suitability, and regional pest profiles.
- **Fragmented Tools**: Gardeners must juggle multiple apps and websites for plant care, shopping, expert advice, and community interaction.
- **No Real-Time Monitoring**: Home growers have no access to IoT-style monitoring dashboards that commercial farms use to track environmental conditions.
- **Isolation from Community**: Urban gardeners often lack access to local seed exchanges, excess harvest sharing networks, and neighborhood gardening communities.
- **No Harvest Utilization Guidance**: Gardeners successfully grow produce but lack ideas on how to use their harvests efficiently, leading to food waste.

UrbanRoots addresses these challenges by providing an all-in-one platform with AI-powered diagnostics, beginner-friendly grow guides, region-specific calendars, simulated IoT dashboards, a community barter exchange, and an AI recipe generator.

---

## 3. Objectives

| # | Objective |
|---|-----------|
| 1 | Develop a responsive, PWA-capable web application for urban gardeners in Karnataka |
| 2 | Integrate Google Gemini AI for plant disease diagnosis, species identification, soil analysis, and recipe generation |
| 3 | Provide a comprehensive plant encyclopedia with 54 crop entries, including hydroponics, vertical farming, and water-saving parameters |
| 4 | Simulate real-time IoT telemetry (pH, EC, temperature, humidity, light) for hydroponic and vertical farming systems |
| 5 | Build a region-specific planting calendar covering 4 Karnataka climate zones and 3 growing methods |
| 6 | Create a community platform with real-time post feeds, likes, comments, and content moderation |
| 7 | Implement a P2P Barter & Seed Swap Hub for hyper-local community exchange across Karnataka zones |
| 8 | Develop step-by-step beginner grow guides with crop-specific disease, fertilizer, and materials instructions |
| 9 | Enable expert consultation booking with Karnataka-based agricultural specialists |
| 10 | Implement a marketplace for gardening supplies with cart management and checkout |
| 11 | Build an AI-powered harvest-to-table recipe generator using Google Gemini |
| 12 | Integrate dynamic GPS-based weather monitoring with reverse geocoding for Karnataka cities |
| 13 | Implement gamification with XP leveling, digital badges, daily streaks, and achievement rewards |
| 14 | Deploy as Vercel Serverless Functions with automated daily watering reminder cron jobs |
| 15 | Ensure data persistence, user authentication, and row-level security through Supabase |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               React 19 + Vite 8 SPA (PWA)                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐  │  │
│  │  │  Pages   │ │Components│ │  Context   │ │   Data     │  │  │
│  │  │ (14 pgs) │ │ (8 comp) │ │(Auth/Cart/ │ │(54 Plants) │  │  │
│  │  │ 6700 LOC │ │  705 LOC │ │  Theme)    │ │ 5104 lines │  │  │
│  │  └──────────┘ └──────────┘ └───────────┘ └────────────┘  │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │ HTTP / REST (relative paths)         │
└──────────────────────────┼──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Vercel Serverless│ │   Supabase   │ │   External APIs  │
│   Functions      │ │   (BaaS)     │ │                  │
│                  │ │              │ │ • Open-Meteo      │
│ • Gemini AI Chat │ │ • PostgreSQL │ │   (Weather)      │
│ • Gemini Vision  │ │ • Auth       │ │ • BigDataCloud   │
│ • Recipe Gen     │ │ • Storage    │ │   (Geocoding)    │
│ • Plant CRUD     │ │ • Realtime   │ │ • Google Maps    │
│ • Resend Email   │ │ • RLS        │ │   (Nurseries)    │
│ • Cron Jobs      │ │              │ │                  │
│ (12 functions)   │ │ (13 tables)  │ │                  │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

### Data Flow

1. **User Authentication** flows through Supabase Auth (email/password + Google OAuth).
2. **CRUD Operations** (plants, posts, bookings, barter listings) interact directly with Supabase from the client using the JS SDK and Row Level Security (RLS) policies.
3. **AI Operations** (image analysis, chat, recipe generation) route through Vercel Serverless Functions, which proxy requests to the Google Gemini API.
4. **Email Notifications** are sent via the Resend API from serverless functions, triggered by Vercel Cron.
5. **Real-time Updates** (community feed) use Supabase Realtime channels for live data synchronization.
6. **Weather Data** is fetched dynamically from Open-Meteo API using GPS coordinates obtained from the browser's Geolocation API, with reverse geocoding via BigDataCloud.
7. **Gamification Events** are dispatched as custom browser events (`xp-awarded`, `badge-unlocked`) and persisted to both Supabase profiles and localStorage fallback.

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

### Backend (Vercel Serverless Functions)

| Technology | Purpose |
|------------|---------|
| Vercel Serverless Functions (Node.js) | 12 serverless API handlers |
| @supabase/supabase-js | Server-side Supabase client |
| Resend | Transactional email service |
| Google Gemini API | AI vision + language model |
| Vercel Cron | Scheduled watering reminder jobs |

### Cloud Services

| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database, authentication, file storage, real-time subscriptions |
| Vercel | Frontend hosting, serverless functions, cron scheduling |
| Google Gemini 2.5 Flash Lite | AI vision (plant/soil analysis) + language model (chat + recipes) |
| Resend | Transactional email delivery |
| Open-Meteo | Free weather API (no key required) |
| BigDataCloud | Free reverse geocoding API (GPS → city name) |
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

**File**: `src/pages/Dashboard.jsx` (1,017 lines)

The Dashboard serves as the primary landing page and control center for the application. It presents a Smart Grow Dashboard interface that simulates an IoT-enabled monitoring system for urban farming setups, integrates live weather, AI recipe generation, gamification, and eco-impact analytics.

**Key Features**:

| Feature | Description |
|---------|-------------|
| **Dynamic GPS Weather** | Uses the browser's HTML5 Geolocation API to obtain the user's real GPS coordinates. Reverse geocodes via BigDataCloud API to resolve the city name (e.g., Mangalore, Puttur, Mysore). Fetches weather from Open-Meteo. Displays current temperature (°C), humidity (%), and wind speed (km/h). Fallback chain: GPS → user profile city → Bangalore. Includes a location source badge (📍 GPS / Profile / Default) and manual refresh button. |
| **IoT Telemetry Simulator** | Simulates real-time sensor readings for pH level, EC conductivity (mS/cm), reservoir temperature, ambient humidity, and light intensity (lux). Data fluctuates every 4 seconds using sinusoidal math functions. Includes SVG sparkline charts tracking the last 20 data points for pH and EC. Status indicator: OPTIMAL / WARNING / ALERT. |
| **Eco-Savings HUD with Explanation** | Computes environmental impact metrics: water saved (liters), space optimization multiplier (up to 8× for vertical towers), eco-score rating (A+/A/B), and CO₂ offset. Includes an expandable "How it works?" panel explaining each metric's calculation methodology — freshwater savings (8.5L/plant/day), space optimization (8× vertical density), eco-impact scoring (A+/A/B scale), and carbon offset formula. |
| **AI Harvest Recipe Generator** | Users select harvested ingredients from their active plants (checkbox grid), enter harvest quantity (e.g., "1kg", "a handful"), and click "Generate 3 Recipes". The system calls `/api/generate-recipes` (Gemini AI) and returns Karnataka-style recipe cards with name, description, difficulty badge, prep time, ingredients list, and step-by-step instructions. Awards 25 XP on generation. |
| **Maintenance Reminders** | Dynamic watering schedule calculated from `last_watered` + `watering_frequency_days` stored in Supabase. Status indicators: Urgent (overdue), Due (today), Done (recently watered). Falls back to mock data when offline. |
| **My Plants Grid** | Displays user's registered plants as cards showing health status (color-coded bar: green/orange/red), grow method tags (Hydroponics, Vertical, Soil), and a quick "Water Now" action button that awards 20 XP. |
| **Add Plant Form** | Inline deployment form to register new plants with species selection, grow method (Hydroponics NFT, Hydroponics DWC, Vertical Grow Tower, Soil Container), and watering frequency. Persists to Supabase `user_plants` table. |
| **Quick Actions** | 7 navigation cards linking to Encyclopedia, Yield Calculator, Plant Calendar, AI Doctor, Market, Experts, and Community modules. |

---

### 6.2 Plant Encyclopedia

**File**: `src/pages/Encyclopedia.jsx` (358 lines)

A searchable, filterable catalog of 54 plants suitable for urban cultivation in Karnataka.

**Key Features**:

- **Search with Autocomplete**: Live fuzzy search across plant name, scientific name, and description. Displays top 5 suggestions in a dropdown popover with click-outside dismissal.
- **Dual Filter System**:
  - *Category Pills*: Vegetables, Herbs, Flowers, Fruits, Indoor, Medicinal
  - *Growing Method Pills*: Hydroponics Suitable, Vertical Towers, Water-Saving 90%+
- **Plant Cards**: Each card displays the plant image, water savings percentage badge, difficulty indicator, suitability tags, key metrics (irrigation loop, sunlight hours, yield cycle), and growing medium.
- **Community Corrections**: A "Suggest Correction" modal allows users to submit parameter corrections for any plant entry, including the field name, corrected value, and verification source. Suggestions are saved to the `plant_suggestions` table for admin review.
- **Loading Skeletons**: Shimmer placeholder animations for 8 card positions while data loads.

**Data Source**: Local static dataset (`plantsData.js` — 5,104 lines, 246 KB) containing comprehensive growing parameters for 54 crop varieties, including 50 standard crops (IDs 1–50) and 4 hydroponic specialty crops (IDs 101–104: Butterhead Lettuce, Vertical Strawberry, Lacinato Kale, Bok Choy).

---

### 6.3 Plant Details & Beginner Grow Guides

**File**: `src/pages/PlantDetails.jsx` (1,118 lines)

A deep-dive page for individual plant species with 6 tabbed content sections and a "Grow This Plant" deployment modal. Specifically designed for beginners who do not have prior gardening experience.

**6 Content Tabs**:

| Tab | Icon | Content |
|-----|------|---------|
| **Beginner Grow Guide** | 🪴 | Complete seedling-to-harvest walkthrough: step-by-step cultivation phases (germination, transplanting, training, harvesting), quick guidelines (water/sun/yield), expert tips, planting season, common pests, soil/substrate info, and materials required (pot types, soil mixes) |
| **Problems & Diseases** | 🩺 | Peak problem timing window, list of common diseases with specific symptoms and organic eradication steps (e.g., "Spray neem oil weekly", "Apply Bordeaux mixture 1%") |
| **Materials & Fertilizers** | 🧪 | Growing media/container specifications, nutrition & fertilizer schedule with type (NPK, vermicompost, bone meal), frequency (every 15 days), quantity (5g per plant), and application method (soil drench, foliar spray) |
| **Hydro & Vertical** | ⚡ | Hydroponics setup (system type, pH range, EC conductivity, nutrient formulation, how the plant grows in water), Vertical farming layout (tower type, spacing, requirements) |
| **Progress & Varieties** | 📈 | Weekly growth phases timeline (4 phases with illustrative images), plant varieties/genetics cards with descriptions |
| **Photo Journal** | 📖 | User-uploaded progress photos stored in Supabase Storage `grow_logs` bucket with notes and timestamps. Displays as a visual growth timeline. Only visible if the user has the plant in their active collection. Awards 50 XP per upload. |

**Beginner Grow Guides Database**: Detailed, crop-specific beginner guides are provided for 9 key Karnataka crops in the `CROP_DETAILS_DB` constant:

| Crop | Guide Includes |
|------|---------------|
| Tomato | 5-step grow process, 3 diseases (Early Blight, Blossom-End Rot, Leaf Curl Virus) with eradication, NPK + calcium fertilizer schedule, Dutch Bucket hydroponics, vertical vine training |
| Hot Pepper | 4-step grow process, Anthracnose/Aphid/Mosaic treatments, phosphorus-rich feeding schedule, DWC hydroponics, staggered pocket wall vertical |
| Brinjal | 4-step grow process, Shoot Borer/Bacterial Wilt/Leaf Spot treatments, NPK schedule, Dutch Bucket hydroponics, tiered shelf vertical |
| Okra | 4-step grow process, Yellow Vein Mosaic/Root Rot/Jassid treatments, phosphorus feeding, DWC hydroponics, single-stem vertical training |
| Spinach | 4-step grow process, Downy Mildew/Leaf Miner treatments, nitrogen-rich foliar schedule, Floating Raft DWC, green-wall vertical |
| Coriander | 4-step grow process, Wilt/Aphid/Powdery Mildew treatments, liquid seaweed schedule, Kratky hydroponics, stacked shelf vertical |
| Mint | 4-step grow process, Rust/Spider Mite/Powdery Mildew treatments, nitrogen compost schedule, Kratky jar hydroponics, aeroponic tower vertical |
| Curry Leaf | 5-step grow process, Scale/Psyllid/Leaf Spot treatments, organic buttermilk feeding, DWC reservoir hydroponics |
| Tulsi | 4-step grow process, Downy Mildew/Root Rot/Leaf Roller treatments, vermicompost schedule, NFT hydroponics, tower pocket vertical |

All other crops receive a generic guide populated from the `plantsData.js` fields.

**"Grow This Plant" Modal**: A deployment dialog that allows users to add the viewed crop directly to their active systems on the Dashboard:
- **Grow Method Selector**: Hydroponics NFT, Hydroponics DWC, Vertical Grow Tower, Soil Container
- **Watering Frequency Slider**: Auto-populated from the crop's recommended schedule
- **Deploy Action**: Calls `/api/plants` POST endpoint, saves to Supabase `user_plants` table with selected `grow_method`, awards XP, navigates to Dashboard
- **Status Check**: Shows "Already Growing" badge if the user has this crop in their collection

---

### 6.4 AI-Powered Plant Tools

**File**: `src/pages/AITools.jsx` (518 lines)

A ChatGPT-style conversational interface powered by Google Gemini 2.5 Flash Lite for image-based plant analysis.

**Three Analysis Modes**:

| Mode | Input | Output |
|------|-------|--------|
| **Disease Diagnosis** | Photo of affected plant | Disease name, severity badge, confidence percentage, treatment plan, prevention tips, links to Marketplace & Experts |
| **Plant Identification** | Photo of unknown plant | Species name, botanical family, care level, biological description, care tips, Kannada name (if known), links to Encyclopedia & Marketplace |
| **Soil Analysis** | Photo of soil sample | Soil type classification, pH estimate, texture analysis, NPK nutrient grid (Nitrogen/Phosphorus/Potassium), amendment recommendations |

**Additional Features**:
- Full chat conversation history with user/AI message bubbles
- Free-form text questions about plant care
- Sidebar with recent scan history and model status indicator
- Chat history persistence via `/api/chat-history/[userId]` endpoint
- Scan results logged to Supabase `ai_scans` table

---

### 6.5 Marketplace & P2P Barter Hub

**File**: `src/pages/Marketplace.jsx` (703 lines) + `src/pages/Checkout.jsx` (159 lines)

A dual-purpose commerce module combining a standard e-commerce shop with a community-driven peer-to-peer barter exchange.

**Tab 1 — Shop Products** (Amazon-style e-commerce):
- 9 curated products: seeds, fertilizers, soil mixes, pots, and tools — all with INR pricing, discount percentages, star ratings, review counts, and badges (Best Seller, Deal of the Day, Organic, Limited Stock, Top Brand).
- Left sidebar filters: Category, Customer Reviews (4★+/3★+/2★+), Price Range (Under ₹200 / ₹200–500 / Over ₹500).
- Product detail modal with deal pricing, description, shipping info ("FREE Delivery tomorrow"), and return policy.
- Full cart integration via `CartContext`.

**Tab 2 — P2P Barter & Seed Swap Hub** (Community Exchange):

This feature transforms the platform from a purely commercial application into a hyper-local, sustainable micro-economy that builds genuine community trust among Karnataka gardeners.

| Feature | Description |
|---------|-------------|
| **List Swap Item** | Users can list excess seeds, harvests, cuttings, or tools for swap or free gifting. Fields: item offered, item wanted, Karnataka zone, contact details, description. Awards +30 XP. |
| **Zone Filtering** | Browse listings filtered by 8 Karnataka zones: Bengaluru Urban, Mangaluru Coast, Mysuru, Hubballi-Dharwad, Belagavi, Kalaburagi, Davanagere, Udupi |
| **Barter Cards** | Display author (name, avatar, city), date, OFFERS ↔ WANTS layout, description, and contact info |
| **Free/Gifting Badge** | Visual badge for items listed as free rather than swap |
| **Swap Status** | "Mark Swapped" / "Completed Swap" toggle to close fulfilled listings |
| **WhatsApp Contact** | Direct WhatsApp link for each listing to facilitate real-world exchange |
| **Badge Unlock** | Listing an item unlocks the "Wicking Wizard" 🧙‍♂️ digital badge |
| **Persistence** | Stored in Supabase `barter_listings` table with localStorage fallback |

**Checkout Features**:
- Order summary with line items, quantities, and prices.
- Coupon codes: `URBAN10` (10% discount), `FREESHIP` (₹50 off shipping).
- ₹50 flat shipping fee with subtotal, discount, and total calculation.
- Mock payment form (card details) with 2-second simulated processing.
- Success confirmation state with cart clearing.

> **Note**: Razorpay payment gateway integration exists in the backend but is currently paused. The frontend uses simulated payment processing.

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

### 6.9 Yield & Water Savings Simulator

**File**: `src/pages/YieldCalculator.jsx` (633 lines)

An interactive impact simulator for urban farming setups with a comprehensive materials & growing methods comparison matrix.

**Input Parameters**:

| Parameter | Range |
|-----------|-------|
| Growing System | Soil / DWC Hydroponics / NFT Hydroponics / Vertical Tower |
| Available Space | 1–50 m² (slider) |
| Harvest Cycles/Year | 1–8 (slider) |
| Crop Selection | Up to 3 crops (from 13 available crops including all vegetables, herbs, and specialty hydroponic plants) |

**Calculated Outputs**:

| Metric | Formula Basis |
|--------|---------------|
| Food Harvested | kg/year based on space × plants/m² × cycles |
| Water Conserved | Liters saved vs. traditional farming |
| Space Efficiency | 1×–8× multiplier (Vertical Tower = 8×) |
| CO₂ Offset | kg/year based on food production |
| Grocery Savings | ₹/year at ₹150/kg average (South India organic pricing index) |
| Eco-Score | A+ / A / B / C (SVG radial progress ring) |

**Setup & Materials Comparison Matrix**: For each selected crop, the calculator displays a side-by-side comparison across three cultivation methods:

| Column | Details Per Method |
|--------|-------------------|
| 🟤 Traditional Soil Potting | Required materials (pot size, soil mix), water footprint, cultivation cycle length, space density |
| ⚡ Hydroponics (DWC/NFT) | Required materials (reservoir, pumps, nutrients), water savings %, faster cycle %, density multiplier |
| 📐 Vertical Tower Grow | Required materials (tower, pump, timer), ultra-low water footprint, cycle speed, maximum density |

Crop-specific comparison data is provided for 13 crops: Tomato, Hot Pepper, Brinjal, Okra, Spinach, Coriander, Mint, Curry Leaf, Tulsi, Butterhead Lettuce, Vertical Strawberry, Lacinato Kale, and Bok Choy. All other crops use a generic comparison template.

**Sharing**: "Share Your Farm Impact" button generates a tweet with calculated stats and opens a Twitter intent URL.

**Gamification**: Achieving an A+ Eco-Score unlocks the "Eco-Score Elite" 🏆 digital badge.

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
- Gamification stats: current XP, level, streak, and unlocked badges
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
- Sends messages to the `/api/chat` serverless function (Gemini AI) with the last 6 messages as conversation context
- System instruction specializes the AI for Karnataka plant care, seasonal planting, and local practices
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

### 6.15 Gamification Engine

**File**: `src/utils/gamification.js` (184 lines) + `src/components/GamificationToasts.jsx`

A comprehensive engagement system that rewards consistent plant care and community participation with XP points, digital achievement badges, and daily care streaks.

**XP Leveling System**:

| Action | XP Awarded |
|--------|------------|
| Watering a plant on time | +20 XP |
| Generating harvest recipes | +25 XP |
| Listing item on Barter Hub | +30 XP |
| Uploading growth photo journal | +50 XP |
| Unlocking any badge (bonus) | +50 XP |
| 3-day care streak milestone | +30 XP |

Level is calculated as `floor(XP / 100) + 1`. Custom browser event `xp-awarded` fires on every XP gain, triggering animated toast notifications via `GamificationToasts.jsx`.

**Digital Achievement Badges** (5 badges):

| Badge ID | Name | Emoji | Unlock Condition |
|----------|------|-------|------------------|
| `monsoon_master` | Monsoon Master | 🌧️ | Maintained a 5+ day consecutive watering streak |
| `hydro_hero` | Hydroponic Hero | ⚡ | Deployed at least 2 hydroponic or vertical systems |
| `photo_journalist` | Photo Journalist | 📸 | Logged 3+ growth photos in the photo journal |
| `ecoscore_elite` | Eco-Score Elite | 🏆 | Achieved an A+ eco-score rating on the Yield Calculator |
| `wicking_wizard` | Wicking Wizard | 🧙‍♂️ | Listed or swapped seeds on the P2P Barter Hub |

Badge unlocks fire a custom `badge-unlocked` browser event with animated notification. Each badge unlock awards +50 bonus XP.

**Daily Care Streak**:
- Tracks consecutive daily activity using `last_active_date` in the user profile
- Resets to 1 if a day is missed
- Every 3-day milestone awards +30 bonus XP
- 5+ day streak unlocks the Monsoon Master badge

**Persistence**: Dual storage — Supabase `profiles` table (columns: `xp`, `streak`, `badges`, `last_active_date`) with `localStorage` fallback for offline/guest users.

---

## 7. Database Design

The application uses **Supabase (PostgreSQL)** with 13 tables and 2 storage buckets. All tables have Row Level Security (RLS) enabled.

### Entity-Relationship Overview

```
┌──────────────────┐     ┌──────────────┐     ┌──────────────────┐
│     profiles     │────<│  user_plants │────<│ plant_growth_logs │
│ (users + gamif.) │     │              │     │   (photo journal) │
│ xp, streak,      │     │ grow_method  │     │                   │
│ badges, level    │     │              │     │                   │
└──────┬───────────┘     └──────────────┘     └──────────────────┘
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
       ├────<┌────────────────────┐
       │     │ push_subscriptions │
       │     └────────────────────┘
       │
       └────<┌──────────────────┐
             │ barter_listings  │
             │ (P2P exchange)   │
             └──────────────────┘

┌──────────────────┐
│ plant_suggestions │  (standalone — not user-linked)
└──────────────────┘
```

### Table Definitions

| # | Table | Primary Key | Foreign Keys | Purpose |
|---|-------|-------------|--------------|---------|
| 1 | `profiles` | `id` (UUID → auth.users) | — | User profile data (name, email, city, avatar, notification prefs) + gamification fields (xp, streak, badges, last_active_date) |
| 2 | `user_plants` | `id` (UUID) | `user_id` → profiles | Registered plants with species, watering frequency, health status, grow method (Hydroponics/Vertical/Soil) |
| 3 | `orders` | `id` (UUID) | `user_id` → profiles | Marketplace purchase records with payment IDs, amounts, shipping address |
| 4 | `bookings` | `id` (UUID) | `user_id` → profiles | Expert consultation bookings with date, time, type, and problem description |
| 5 | `plant_suggestions` | `id` (UUID) | — | Community-submitted encyclopedia corrections (plant, field, value, reason) |
| 6 | `ai_scans` | `id` (UUID) | `user_id` → profiles | AI analysis results stored as JSONB (disease/identify/soil mode) |
| 7 | `chat_history` | `id` (UUID) | `user_id` → profiles | Chatbot conversation logs (user message + bot response) |
| 8 | `community_posts` | `id` (UUID) | `user_id` → profiles | Community feed posts (type: tip/question/showcase, content, tags) |
| 9 | `community_comments` | `id` (UUID) | `post_id` → community_posts, `user_id` → profiles | Comments on community posts |
| 10 | `post_likes` | `id` (UUID) | `user_id` → profiles, `post_id` → community_posts | Like/dislike records (unique per user per post) |
| 11 | `plant_growth_logs` | `id` (UUID) | `plant_id` → user_plants, `user_id` → profiles | Photo journal entries with image URL, notes, and date |
| 12 | `push_subscriptions` | `id` (UUID) | `user_id` → profiles | Web push notification subscription JSON (unique per user) |
| 13 | `barter_listings` | `id` (UUID) | `user_id` → profiles | P2P barter hub listings with item offered, item wanted, zone, contact, status |

### Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `grow_logs` | Plant growth progress photos uploaded from Photo Journal |
| `avatars` | User profile picture uploads |

### Row Level Security (RLS) Policies

All tables have RLS enabled with the following policy patterns:

- **User-owned data** (plants, orders, bookings, growth logs, push subscriptions, barter listings): Users can only access their own records (`auth.uid() = user_id`).
- **Public-read data** (community posts, comments, likes, suggestions, scans, chat history): Anyone can read; only authenticated owners can create/update/delete.
- **Profiles**: Users can select, update, and delete only their own profile. Anyone can insert (for initial signup).

---

## 8. Backend API Reference

**Server**: Vercel Serverless Functions (Node.js runtime) — 12 function files deployed to `/api/` routes.

### Serverless Function Map

| # | File | Method | Endpoint | Description |
|---|------|--------|----------|-------------|
| 1 | `_utils.js` | — | — | Shared utilities: Supabase client, Resend client, Gemini API key, CORS handler |
| 2 | `health.js` | `GET` | `/api/health` | Health check — returns `{ status: 'ok', using: 'Gemini API' }` |
| 3 | `chat.js` | `POST` | `/api/chat` | AI chat — Karnataka plant care Q&A via Gemini. Body: `{ message, history[], userId? }`. Logs to `chat_history` table. |
| 4 | `chat-history/[userId].js` | `GET` | `/api/chat-history/:userId` | Fetch user's chat conversation logs ordered by date |
| 5 | `analyze-plant.js` | `POST` | `/api/analyze-plant` | AI vision analysis — disease diagnosis, plant identification, or soil analysis. Body: `{ image (base64), mode }`. Returns structured JSON. |
| 6 | `generate-recipes.js` | `POST` | `/api/generate-recipes` | AI recipe generation — Karnataka-style recipes from garden harvests. Body: `{ ingredients[], harvestQty, recipeCount }`. Returns array of recipe objects with instructions as arrays. Falls back to mock recipes if no API key. |
| 7 | `plants.js` | `POST` | `/api/plants` | Create a user plant. Body: `{ userId, plantName, species, wateringFrequencyDays, growMethod }`. |
| 8 | `plants/[id]/water.js` | `PATCH` | `/api/plants/:id/water` | Mark a plant as watered — updates `last_watered` timestamp |
| 9 | `plants/[id]/index.js` | `DELETE` | `/api/plants/:id` | Remove a plant from user's collection |
| 10 | `push/subscribe.js` | `POST` | `/api/push/subscribe` | Save web push notification subscription |
| 11 | `book-expert.js` | `POST` | `/api/book-expert` | Book expert consultation + send confirmation email via Resend |
| 12 | `cron/water-reminder.js` | `GET` (Cron) | `/api/cron/water-reminder` | Daily watering reminder — queries overdue plants, groups by user, sends HTML emails via Resend |

### Cron Jobs (Vercel Cron)

| Schedule | Job | Description |
|----------|-----|-------------|
| `0 7 * * *` (Daily at 7:00 AM UTC) | Watering Reminder Emails | Queries `user_plants` joined with `profiles`. Identifies plants where `last_watered + watering_frequency_days ≤ today`. Groups overdue plants by user email. Sends styled HTML reminder emails via Resend to users with `email_notifications_enabled = true`. |

### CORS Configuration

All serverless functions implement CORS via the shared `cors()` utility:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- OPTIONS preflight requests return `200` immediately.

---

## 9. Third-Party Integrations

| Service | Usage | Configuration |
|---------|-------|---------------|
| **Supabase** | Database (PostgreSQL), Authentication (email/password + Google OAuth), File Storage (avatars, grow_logs), Realtime subscriptions (community feed) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| **Google Gemini 2.5 Flash Lite** | AI Vision (plant disease diagnosis, species identification, soil analysis from images), Language Model (conversational plant care Q&A), Recipe Generation (harvest-to-table) | `GEMINI_API_KEY` (serverless) |
| **Resend** | Transactional email delivery for watering reminders and booking confirmations | `RESEND_API_KEY` (serverless) |
| **Open-Meteo** | Free weather API — current temperature, humidity, wind speed based on dynamic GPS coordinates | No API key required |
| **BigDataCloud** | Free reverse geocoding API — converts GPS coordinates to city/locality names (e.g., lat/lng → "Mangalore") | No API key required |
| **Google Maps Platform** | Maps embed for nursery finder, Places API, Geolocation | `VITE_GOOGLE_MAPS_API_KEY` |
| **Razorpay** | Payment gateway for marketplace orders (currently paused) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (serverless) |
| **Vercel** | Frontend hosting, serverless function deployment, cron job scheduling | Automatic via `vercel.json` |

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

### Gamification State

- Managed via utility functions in `gamification.js` (not a React Context, but a dual-storage state layer)
- Persists to Supabase `profiles` table for authenticated users
- Falls back to `localStorage` for guest users
- Custom browser events (`xp-awarded`, `badge-unlocked`) consumed by `GamificationToasts.jsx` component

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
- **Toast Notifications**: Fixed bottom-center with green border glow. Gamification toasts include XP amount, action name, and level-up animation.
- **Border Radii**: sm (8px), md (16px), lg (24px), full (9999px).
- **Responsive Design**: Mobile bottom navigation bar, hamburger menu drawer, responsive grid layouts.

---

## 12. Security

| Measure | Implementation |
|---------|---------------|
| **Row Level Security (RLS)** | All 13 Supabase tables have RLS enabled. Policies enforce that users can only access their own data for sensitive tables (plants, orders, bookings, barter listings, growth logs). |
| **Authentication** | Supabase Auth with email/password and Google OAuth. JWT-based session management. |
| **Environment Variables** | Sensitive keys (Supabase, Gemini, Resend, Google Maps) stored in Vercel Environment Variables for serverless functions. `VITE_`-prefixed variables exposed to frontend at build time. `.env` files excluded from version control via `.gitignore`. |
| **CORS** | All serverless functions implement permissive CORS headers via shared `cors()` utility for cross-origin API access. |
| **Production URL Resolution** | Client-side code dynamically resolves `BACKEND_URL` — uses relative paths (`''`) in production (Vercel) and `http://localhost:3000` only when running on localhost. Prevents accidental localhost API calls in deployed builds. |
| **Input Validation** | AI analysis endpoints include prompt instructions to reject non-plant images. Recipe endpoint validates ingredients array before processing. |

---

## 13. Deployment Architecture

The application is deployed on **Vercel** with a hybrid architecture:

### Frontend (Static SPA)
- Built with `vite build` → output to `dist/` directory
- Served as static files from Vercel's edge CDN
- SPA routing handled via rewrite rule: `/((?!api/).*)` → `/index.html`

### Backend (Serverless Functions)
- 12 JavaScript files in the `api/` directory
- Each file exports a default async handler function
- Automatically deployed as individual Vercel Serverless Functions
- API routing: `/api/(.*)` → `/api/$1`

### Configuration (`vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "crons": [
    {
      "path": "/api/cron/water-reminder",
      "schedule": "0 7 * * *"
    }
  ]
}
```

### Required Environment Variables (Vercel Dashboard)

| Variable | Scope | Purpose |
|----------|-------|---------|
| `SUPABASE_URL` | Serverless | Supabase project URL |
| `SUPABASE_ANON_KEY` | Serverless | Supabase anonymous key |
| `GEMINI_API_KEY` | Serverless | Google Gemini API key |
| `RESEND_API_KEY` | Serverless | Resend email service key |
| `VITE_SUPABASE_URL` | Build-time | Supabase URL for frontend |
| `VITE_SUPABASE_ANON_KEY` | Build-time | Supabase anon key for frontend |
| `VITE_GOOGLE_MAPS_API_KEY` | Build-time | Google Maps API key |

---

## 14. Future Enhancements

| # | Enhancement | Description |
|---|-------------|-------------|
| 1 | **Live Razorpay Payments** | Reactivate the Razorpay endpoints to enable real payment processing for marketplace orders. |
| 2 | **Real IoT Integration** | Replace the simulated telemetry with actual sensor data from ESP32/Arduino-based hydroponic monitoring systems via MQTT or WebSocket. |
| 3 | **Push Notifications** | Implement Web Push API using the existing `push_subscriptions` table infrastructure to deliver browser-native watering reminders. |
| 4 | **Multi-Language Support** | Add Kannada (ಕನ್ನಡ) and Hindi (हिन्दी) localization for broader Karnataka user accessibility. |
| 5 | **Plant Disease Model Fine-Tuning** | Fine-tune the Gemini vision model on Karnataka-specific crop diseases for higher diagnostic accuracy. |
| 6 | **Social Image Sharing** | Enable image uploads in community posts (currently text-only) for plant showcases. |
| 7 | **Order Tracking** | Add real-time order tracking with delivery status updates for marketplace purchases. |
| 8 | **Leaderboard** | Add a public leaderboard ranking users by XP, badges, and care streaks to foster friendly competition. |
| 9 | **Barter Chat** | Add in-app messaging between barter participants instead of relying solely on WhatsApp links. |
| 10 | **Seasonal Recipe Collections** | Curate AI-generated recipe collections based on Karnataka's monsoon, winter, and summer harvests. |

---

## 15. Conclusion

UrbanRoots is a feature-rich, full-stack Progressive Web Application that addresses the growing demand for accessible urban gardening tools in Karnataka, India. By combining a modern React 19 frontend with Supabase backend services, Vercel Serverless Functions, and Google Gemini AI capabilities, the platform provides an integrated experience spanning plant monitoring, AI-powered diagnostics and recipe generation, community-driven barter exchange, gamification, and expert consultations.

The application goes beyond traditional gardening tools by fostering a genuine community micro-economy through the P2P Barter & Seed Swap Hub, empowering complete beginners with step-by-step crop-specific grow guides, and motivating consistent care through an XP-based gamification system with digital achievement badges.

The platform demonstrates effective use of contemporary web technologies including React 19, Vite 8, Supabase Realtime, Vercel Serverless Functions, and the Gemini 2.5 Flash Lite vision/language model. With its region-specific planting calendar, Karnataka-focused expert network, dynamic GPS-based weather, and localized content, UrbanRoots is uniquely positioned to serve the Indian urban farming community.

The modular architecture, comprehensive database design with Row Level Security, serverless deployment on Vercel, and clean separation of concerns ensure that the platform is maintainable, scalable, and production-ready.

### Project Statistics

| Metric | Value |
|--------|-------|
| Total Page Components | 14 |
| Total Shared Components | 8 |
| Total JSX Lines of Code | ~7,000+ |
| Plant Encyclopedia Entries | 54 crops |
| Serverless API Functions | 12 |
| Database Tables | 13 |
| Storage Buckets | 2 |
| Gamification Badges | 5 |
| Karnataka Climate Zones | 4 |
| Barter Hub Zones | 8 |
| Beginner Grow Guides | 9 crop-specific + generic fallback |
| Yield Comparison Crops | 13 |

---

> **Project**: UrbanRoots — Grow Green in the City
> **Platform**: Progressive Web Application (PWA)
> **Stack**: React 19 + Vite 8 | Vercel Serverless Functions | Supabase | Google Gemini AI
> **Deployment**: Vercel (Frontend + Serverless + Cron)
> **Target Region**: Karnataka, India
> **Date**: May 2026
