# Hambalyo — Digital Wedding Message Wall

> Bespoke Somali Matrimonial Stationery Keepsake Suite & Real-Time Guest Message Wall.

---

## 1. Overview

**Hambalyo** is an elegant, real-time digital wedding message wall designed to let wedding guests leave personal, relationship-tagged blessings and congratulations for the couple without requiring authentication or account creation.

The project translates the luxury of 400gsm cotton wedding cardstock, hand-lettered gold leaf typography, and intimate cultural matrimony into a modern, lightning-fast web experience.

---

## 2. Implemented Features

- **Pixel-Perfect Stationery Design:**
  - Warm ivory backdrop (`#FDFBF7`) with tactile paper grain.
  - Deep burgundy headings (`#4A1525` / `#2F0211`).
  - Champagne gold accents (`#C5A059`) and warm metallic highlights (`#D4AF37`).
  - Editorial typography: **Playfair Display** (High-contrast serif) paired with **Plus Jakarta Sans** (Geometric legible sans).
  - Floating 3D stationery card elevation with warm ambient shadows.

- **Guest Blessing Submission (FR-01, FR-02):**
  - Instant guest posting without login.
  - Relationship selector tags: `Waalid` (Parent), `Walal` (Sibling), `Saaxib` (Close Friend), `Xiriir` (In-Law/Kinship), `Macallin` (Teacher/Mentor), `Jaar` (Neighbor).
  - Character-counter (350 character limit) with real-time feedback.
  - Table portrait moment photo attachment option.

- **Real-Time Synchronization (FR-03, NFR-01):**
  - **Server-Sent Events (SSE):** Connected clients receive instant broadcasts when new blessings are posted.
  - **BroadcastChannel API:** Multi-tab browser synchronization under 50ms.
  - **Optimistic UI Updates:** Instant rendering of guest wishes at the top of the wall before server roundtrip.
  - **Celebration Effects:** Multi-stage gold/burgundy confetti explosion (`canvas-confetti`) and synthesized gentle wedding chime via Web Audio API.

- **Stationery Wall & Interactions:**
  - Filter tabs: *All Blessings*, *Family (Waalid & Walal)*, *Close Friends (Saaxib)*, *Mentors & Neighbors (Macallin & Jaar)*.
  - Live search by guest name, dua, or message content.
  - Dynamic blessing counter (initial 142 + live guest additions).
  - Heart reactions with like counter increment.

- **Interactive Reception Suite:**
  - **Wedding Playlist ♫:** Interactive ambient lute/wedding melody toggle.
  - **Voice Notes 🎙️:** Audio voice note recording modal with live waveform simulation and playback.
  - **Photo Keepsakes 📷:** Reception portrait moments upload and gallery.
  - **Reception Table Card 📷:** Printable table tent preview with QR code to scan directly from guest seats.
  - **Couple Keepsake:** Story of Amina & Farhan and celebration schedule.

- **Content Moderation (FR-06):**
  - Lightweight moderator view (toggle via avatar button in navbar).
  - Hide/unhide inappropriate messages instantly.
  - Permanent delete action with confirmation.

- **Offline & Local Storage Persistence (FR-04 Ready):**
  - Fully functional in-memory and `localStorage` caching so messages persist across sessions even without an external database configured.
  - Seamless migration path to Supabase, PostgreSQL, or Firebase.

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Google Material Symbols.
- **Animations & FX:** Canvas Confetti, Web Audio API synthesizer.
- **Backend & Realtime:** Node.js HTTP Server & Vite dev server middleware with Server-Sent Events (SSE) streaming.
- **Storage:** In-memory store + LocalStorage fallback, ready for SQL/NoSQL database integration.

---

## 4. Running the Application

### Development Mode
```bash
npm run dev
```
Starts the Vite dev server with real-time SSE endpoints at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```
Compiles TypeScript, bundles optimized assets, and launches the production server at `http://localhost:3000`.

---

## 5. Database Integration Guide (Next Step)

When you are ready to connect a persistent database:
1. **Supabase / PostgreSQL:**
   - Create the `messages` table using the schema in Section 7 of the specification.
   - Replace the endpoints in `server.js` or `src/services/blessingService.ts` with Supabase client calls (`supabase.from('messages').insert(...)` and `supabase.channel('messages').on(...)`).
2. **Firebase Firestore:**
   - Add the Firebase SDK and bind `onSnapshot()` to `collection('messages')`.
