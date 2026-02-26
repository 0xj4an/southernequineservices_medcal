# Equine Medication Dosing Calculator - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack web app for Southern Equine Service that calculates medication dosages for horses, with a public calculator and an admin CRUD dashboard.

**Architecture:** Next.js 14 App Router serves both the public calculator UI and admin dashboard. Prisma ORM connects to PostgreSQL (Railway). NextAuth.js handles admin login with simple credentials. Tailwind CSS for styling aligned with Southern Equine Service branding.

**Tech Stack:** Next.js 14, React, TypeScript, Prisma, PostgreSQL, NextAuth.js, Tailwind CSS

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.example`, `.gitignore`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Step 2: Install dependencies**

Run:
```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install -D @types/node
```

**Step 3: Create .env.example**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/equine_dosing"
NEXTAUTH_SECRET="generate-a-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-this-password"
```

**Step 4: Create .env with local dev values**

Copy `.env.example` to `.env` and fill with local dev values.

**Step 5: Verify app runs**

Run: `npm run dev`
Expected: App loads at http://localhost:3000

**Step 6: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Next.js project with dependencies"
```

---

### Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/prisma.ts`

**Step 1: Initialize Prisma**

Run:
```bash
npx prisma init
```

**Step 2: Define schema**

File: `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Medication {
  id                String   @id @default(uuid())
  name              String
  category          String
  doseMin           Float
  doseMax           Float
  concentration     Float
  concentrationUnit String   @default("mg/ml")
  route             String
  notes             String?
  isDefault         Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Step 3: Create Prisma client singleton**

File: `src/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 4: Create seed file**

File: `prisma/seed.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const medications = [
  {
    name: 'Phenylbutazone',
    category: 'Analgesic',
    doseMin: 2.2,
    doseMax: 4.4,
    concentration: 200,
    concentrationUnit: 'mg/ml',
    route: 'IV',
    notes: 'IV strictly intravenous only - causes severe tissue necrosis if perivascular. Limit IV to 5 consecutive days.',
    isDefault: true,
  },
  {
    name: 'Flunixin Meglumine (Banamine)',
    category: 'Analgesic',
    doseMin: 1.1,
    doseMax: 1.1,
    concentration: 50,
    concentrationUnit: 'mg/ml',
    route: 'IV',
    notes: 'Standard dose 1.1 mg/kg once daily for up to 5 days. IV preferred - IM use can cause clostridial myositis.',
    isDefault: true,
  },
  {
    name: 'Gentamicin',
    category: 'Antibiotic',
    doseMin: 6.6,
    doseMax: 10.0,
    concentration: 100,
    concentrationUnit: 'mg/ml',
    route: 'IV',
    notes: 'Once daily dosing (q24h). Monitor renal function (target trough <2 ug/mL). Neonatal foals: 12 mg/kg q24h.',
    isDefault: true,
  },
  {
    name: 'Naxcel (Ceftiofur Sodium)',
    category: 'Antibiotic',
    doseMin: 2.2,
    doseMax: 4.4,
    concentration: 50,
    concentrationUnit: 'mg/ml',
    route: 'IM',
    notes: 'Reconstitute 1g vial with 20 mL sterile water. Administer q24h. Max 10 mL per injection site.',
    isDefault: true,
  },
  {
    name: 'Excede (Ceftiofur CFA)',
    category: 'Antibiotic',
    doseMin: 6.6,
    doseMax: 6.6,
    concentration: 200,
    concentrationUnit: 'mg/ml',
    route: 'IM',
    notes: 'Two doses given 4 days apart. Long-acting. Max 20 mL per injection site.',
    isDefault: true,
  },
  {
    name: 'SMZ-TMP (Sulfamethoxazole-Trimethoprim)',
    category: 'Antibiotic',
    doseMin: 15,
    doseMax: 30,
    concentration: 960,
    concentrationUnit: 'mg/tablet',
    route: 'PO',
    notes: 'Oral tablets. Dose is total combined SMZ+TMP. Given BID. Tablets can be dissolved for oral syringe. 10-14 day course typical.',
    isDefault: true,
  },
  {
    name: 'Xylazine',
    category: 'Induction',
    doseMin: 0.5,
    doseMax: 1.1,
    concentration: 100,
    concentrationUnit: 'mg/ml',
    route: 'IV',
    notes: 'Alpha-2 agonist. Lower dose for standing sedation, higher for pre-anesthetic. Onset: 3-5 min IV.',
    isDefault: true,
  },
  {
    name: 'Midazolam',
    category: 'Induction',
    doseMin: 0.03,
    doseMax: 0.1,
    concentration: 5,
    concentrationUnit: 'mg/ml',
    route: 'IV',
    notes: 'Co-induction agent with ketamine. Standard: 0.06 mg/kg IV. Provides muscle relaxation. Must be preceded by alpha-2 sedation.',
    isDefault: true,
  },
  {
    name: 'Ketamine',
    category: 'Induction',
    doseMin: 2.2,
    doseMax: 3.0,
    concentration: 100,
    concentrationUnit: 'mg/ml',
    route: 'IV',
    notes: 'Dissociative anesthetic. Must be given after adequate sedation. Duration: 10-15 min. Do not give without prior sedation.',
    isDefault: true,
  },
]

async function main() {
  console.log('Seeding medications...')
  for (const med of medications) {
    await prisma.medication.upsert({
      where: { id: med.name },
      update: med,
      create: med,
    })
  }
  console.log('Seeded 9 medications.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Step 5: Add seed script to package.json**

Add to `package.json`:
```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

**Step 6: Install tsx for seed**

Run: `npm install -D tsx`

**Step 7: Run migration and seed**

Run:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add Prisma schema, migration, and seed data for 9 medications"
```

---

### Task 3: API Routes for Medications

**Files:**
- Create: `src/app/api/medications/route.ts`
- Create: `src/app/api/medications/[id]/route.ts`

**Step 1: Create GET all + POST route**

File: `src/app/api/medications/route.ts`
```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const medications = await prisma.medication.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(medications)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const medication = await prisma.medication.create({ data: body })
  return NextResponse.json(medication, { status: 201 })
}
```

**Step 2: Create GET one, PUT, DELETE route**

File: `src/app/api/medications/[id]/route.ts`
```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const medication = await prisma.medication.findUnique({ where: { id } })
  if (!medication) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(medication)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const medication = await prisma.medication.update({ where: { id }, data: body })
  return NextResponse.json(medication)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.medication.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

**Step 3: Verify API works**

Run: `npm run dev`
Test: `curl http://localhost:3000/api/medications`
Expected: JSON array of 9 medications

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add CRUD API routes for medications"
```

---

### Task 4: NextAuth.js Admin Authentication

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/admin/login/page.tsx`

**Step 1: Create auth config**

File: `src/lib/auth.ts`
```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: '1', name: 'Admin' }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
}
```

**Step 2: Create auth route**

File: `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Step 3: Create login page**

File: `src/app/admin/login/page.tsx`
Login form with Southern Equine Service branding, username/password fields, submit button. Uses `signIn('credentials')` from next-auth/react.

**Step 4: Protect admin routes with middleware**

File: `src/middleware.ts`
```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/admin/:path*'],
}
```

Exclude `/admin/login` from protection inside the middleware logic.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add NextAuth admin authentication with credentials"
```

---

### Task 5: Public Calculator UI

**Files:**
- Create: `src/app/page.tsx` (replace default)
- Create: `src/app/globals.css` (update with branding)
- Create: `src/components/Calculator.tsx`
- Create: `src/components/MedicationCard.tsx`
- Create: `src/components/Header.tsx`

**Step 1: Create Header component**

Southern Equine Service branding header with logo text, navigation. Navy/charcoal background, clean sans-serif typography.

**Step 2: Create Calculator component**

Main calculator with:
- Weight input (kg) with number input and slider
- Medication list grouped by category (Analgesic, Antibiotic, Induction)
- Click a medication to calculate
- Display results: min ml, max ml, route, notes

**Step 3: Create MedicationCard component**

Card showing medication name, dose range, route badge. On click, shows calculated result based on entered weight.

**Step 4: Wire up the main page**

Fetch medications from `/api/medications`, pass to Calculator. Server component that fetches data, passes to client components.

**Step 5: Style with Tailwind**

Aligned with southernequineservice.com:
- `bg-white` / `bg-gray-50` backgrounds
- `text-[#222]` for text
- Gold/amber accents for highlights and buttons
- Clean card-based layout
- Mobile-first responsive grid

**Step 6: Verify calculator works**

Run: `npm run dev`
Test: Enter weight 450kg, click Ketamine
Expected: Min = (2.2 * 450) / 100 = 9.9 ml, Max = (3.0 * 450) / 100 = 13.5 ml

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add public medication dosing calculator UI"
```

---

### Task 6: Admin Dashboard CRUD UI

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/MedicationForm.tsx`
- Create: `src/components/admin/MedicationTable.tsx`

**Step 1: Create admin layout**

Admin layout with sidebar/header showing "Admin Dashboard", logout button, navigation.

**Step 2: Create MedicationTable component**

Table listing all medications with columns: Name, Category, Dose Range, Concentration, Route, Actions (Edit/Delete). Sortable by category.

**Step 3: Create MedicationForm component**

Form for creating/editing medications with fields: name, category (dropdown), doseMin, doseMax, concentration, concentrationUnit, route (dropdown), notes (textarea).

**Step 4: Wire up admin page**

Admin page showing table + "Add Medication" button. Modal or page for create/edit form. Delete with confirmation dialog.

**Step 5: Connect to API**

POST to create, PUT to update, DELETE to remove. Optimistic updates for good UX.

**Step 6: Verify CRUD works**

Test: Login as admin, create a new medication, edit it, delete it.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add admin dashboard with CRUD for medications"
```

---

### Task 7: Polish & Deploy Prep

**Files:**
- Modify: `src/app/layout.tsx` (metadata)
- Create: `Dockerfile` or `railway.json` if needed

**Step 1: Add metadata and favicon**

Title: "Southern Equine Service - Medication Dosing Calculator"
Description for SEO.

**Step 2: Add loading states and error handling**

Loading skeletons for medication list. Error boundaries for API failures. Toast notifications for admin CRUD operations.

**Step 3: Test responsive design**

Verify calculator works well on mobile (375px), tablet (768px), desktop (1280px).

**Step 4: Prepare for Railway deploy**

Add build command for Prisma: `prisma generate && next build`
Ensure DATABASE_URL, NEXTAUTH_SECRET, ADMIN credentials are set as Railway env vars.

**Step 5: Commit**

```bash
git add -A && git commit -m "chore: polish UI and prepare for Railway deployment"
```

---

## Execution Order

1. Task 1: Project Scaffolding
2. Task 2: Prisma Schema & DB
3. Task 3: API Routes
4. Task 4: Auth
5. Task 5: Public Calculator UI
6. Task 6: Admin Dashboard
7. Task 7: Polish & Deploy
