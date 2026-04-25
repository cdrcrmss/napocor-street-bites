# Napocor Sari-Sari Store (Next.js + PostgreSQL)

Production-ready admin-only sari-sari store system for tablet and laptop, deployable on Vercel.

## Features

- Admin-only login
- Inventory management
	- Add item, update stock quickly, edit prices, delete item
	- Cost price (original) and selling price
- POS checkout
	- Add products to cart
	- Automatic stock deduction after checkout
	- Cash input and change computation
	- Receipt preview and printable receipt
- Sales tracking and analytics
	- Daily, weekly, monthly totals
	- Profit tracking
	- Sales transaction history with receipt code search
	- Top selling items this month

## Tech Stack

- Next.js 14 (App Router)
- PostgreSQL (recommended on Supabase or Neon)
- Prisma ORM
- Deployed on Vercel

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
copy .env.example .env
```

3. Edit `.env` values:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `STORE_NAME`

4. Push Prisma schema to database:

```bash
npm run prisma:push
```

5. Run development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Vercel Deployment

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env` in Vercel Project Settings.
4. Deploy.
5. After first deploy, run `npm run prisma:push` against your production DB.

## Database Recommendation

Use PostgreSQL (SQL). This project uses transactions during checkout so sales recording and stock deduction stay consistent.
