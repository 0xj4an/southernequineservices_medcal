# Southern Equine Service — Medication Dosing Calculator

Equine medication dosing calculator for veterinary professionals. Calculates volume to administer based on horse weight, medication dose range (mg/kg), and concentration.

**Formula:** `Volume = (Dose x Weight) / Concentration`

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Prisma 7** with PostgreSQL (Driver Adapters)
- **NextAuth v4** for admin login
- **Tailwind CSS v4**
- **Railway** for deployment

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed default medications
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Session encryption secret |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |

## Railway Deployment

1. Connect repo to Railway
2. Add a PostgreSQL service
3. Set `DATABASE_URL` referencing the Postgres service
4. Set `NEXTAUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
5. Deploy — schema auto-pushes on start

## Default Medications (9)

| Category | Medication | Dose | Route |
|---|---|---|---|
| Analgesic | Phenylbutazone | 2.2–4.4 mg/kg | IV |
| Analgesic | Flunixin Meglumine (Banamine) | 1.1 mg/kg | IV |
| Antibiotic | Gentamicin | 6.6–10.0 mg/kg | IV |
| Antibiotic | Naxcel (Ceftiofur Sodium) | 2.2–4.4 mg/kg | IM |
| Antibiotic | Excede (Ceftiofur CFA) | 6.6 mg/kg | IM |
| Antibiotic | SMZ-TMP | 15–30 mg/kg | PO |
| Induction | Xylazine | 0.5–1.1 mg/kg | IV |
| Induction | Midazolam | 0.03–0.1 mg/kg | IV |
| Induction | Ketamine | 2.2–3.0 mg/kg | IV |
