# southernequineservices_medcal

Equine medication dosing calculator for Southern Equine Service.

## Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` — SQLite (`file:./dev.db`) or PostgreSQL connection string
- `NEXTAUTH_SECRET` — session secret
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin login credentials
