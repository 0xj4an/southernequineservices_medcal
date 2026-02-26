# Equine Medication Dosing Calculator - Design

## Overview
Web app for Southern Equine Service to calculate medication dosages for horses based on weight, dose range, and drug concentration.

## Stack
- Next.js 14 (App Router)
- Prisma ORM + PostgreSQL (Railway)
- NextAuth.js (admin login)
- Tailwind CSS (aligned with southernequineservice.com branding)
- Deploy: Railway

## Architecture

### Public Calculator (`/`)
- Select medication from list (grouped by category)
- Enter horse weight in kg
- Calculate: Volume (ml) = (Dose mg/kg x Weight kg) / Concentration mg/ml
- Display min/max ml range, route, and notes

### Admin Dashboard (`/admin`) - Login required
- CRUD for medications
- Simple credentials auth (env vars)

## Data Model

```prisma
model Medication {
  id            String   @id @default(uuid())
  name          String
  category      String   // "Analgesic" | "Antibiotic" | "Induction"
  doseMin       Float    // mg/kg
  doseMax       Float    // mg/kg
  concentration Float    // mg/ml
  concentrationUnit String @default("mg/ml")
  route         String   // "IV" | "IM" | "PO"
  notes         String?
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Seed Data (9 medications)

| Name | Category | DoseMin | DoseMax | Concentration | Route |
|------|----------|---------|---------|---------------|-------|
| Phenylbutazone | Analgesic | 2.2 | 4.4 | 200 | IV |
| Flunixin Meglumine | Analgesic | 1.1 | 1.1 | 50 | IV |
| Gentamicin | Antibiotic | 6.6 | 10.0 | 100 | IV |
| Naxcel (Ceftiofur Sodium) | Antibiotic | 2.2 | 4.4 | 50 | IM |
| Excede (Ceftiofur CFA) | Antibiotic | 6.6 | 6.6 | 200 | IM |
| SMZ-TMP | Antibiotic | 15 | 30 | 960 | PO |
| Xylazine | Induction | 0.5 | 1.1 | 100 | IV |
| Midazolam | Induction | 0.03 | 0.1 | 5 | IV |
| Ketamine | Induction | 2.2 | 3.0 | 100 | IV |

## Design
- Colors: White/off-white bg, navy/charcoal (#222) text, gold/tan accents
- Typography: Clean sans-serif
- Layout: Mobile-first, responsive
- Branding: Southern Equine Service header
