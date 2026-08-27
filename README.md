# Kutumba Ashirvada Sadassu 2026

Registration and admin dashboard for the 3rd Annual Family Blessing Convention (Next Generation Ministries).

## Features

- Public invite and registration page
- Admin dashboard for managing registrations
- QR code check-in
- WhatsApp message templates
- Event agenda management
- Firebase Firestore integration (with local fallback for development)

## Prerequisites

- Node.js 18 or newer
- npm

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env
   ```

   Required variables are documented in `.env.example`.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app:

   - Public site: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`
   - QR check-in: `http://localhost:3000/admin/checkin`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Express + Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run TypeScript type checks |

## Deployment

This project is configured for Vercel:

- Frontend build: `npm run build`
- API routes: `api/index.ts` (serverless)
- Routing: `vercel.json`

Set environment variables in Vercel using `.env.example` as a guide.
