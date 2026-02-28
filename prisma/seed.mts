import 'dotenv/config'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientPath = resolve(__dirname, '../src/generated/prisma/client.ts')
const mod = await import(clientPath)
const PrismaClient = mod.PrismaClient

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

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
    name: 'SMZ-TMP',
    category: 'Antibiotic',
    doseMin: 15,
    doseMax: 30,
    concentration: 960,
    concentrationUnit: 'mg/tablet',
    route: 'PO',
    notes: 'Oral tablets (960mg each = 800mg SMZ + 160mg TMP). Dose is total combined. Given BID. 10-14 day course typical.',
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
    notes: 'Alpha-2 agonist. Lower dose (0.5) for standing sedation, higher (1.1) for pre-anesthetic. Onset: 3-5 min IV.',
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
  {
    name: 'Diazepam',
    category: 'Induction',
    doseMin: 0.05,
    doseMax: 0.1,
    concentration: 5,
    concentrationUnit: 'mg/ml',
    route: 'IV',
    notes: 'Co-induction agent with ketamine. IV only. Do NOT give alone — causes ataxia and excitement. Light sensitive, do not store in plastic syringes. Incompatible with most drugs except ketamine.',
    isDefault: true,
  },
]

const criMedications = [
  {
    name: 'Dobutamine',
    category: 'Induction',
    loadingDoseMin: 0,
    loadingDoseMax: 0,
    rateMin: 1,
    rateMax: 5,
    rateUnit: 'mcg/kg/min',
    concentration: 12.5,
    concentrationUnit: 'mg/ml',
    notes: 'Beta-1 agonist inotrope. NO loading dose — start CRI at 1-2 mcg/kg/min, titrate q3-5 min to MAP ≥70 mmHg. Max 5 mcg/kg/min. Requires continuous arterial BP & ECG monitoring. Reduce/stop if HR >45-50 bpm or arrhythmias. Half-life ~2 min. Primary use: intraoperative hypotension under general anesthesia. Do not bolus.',
  },
]

async function main() {
  console.log('Seeding default medications...')
  for (const med of medications) {
    await prisma.medication.upsert({
      where: {
        id: (await prisma.medication.findFirst({
          where: { name: med.name, route: med.route, isDefault: true },
          select: { id: true },
        }))?.id ?? 'nonexistent',
      },
      update: med,
      create: med,
    })
  }
  console.log(`Seeded ${medications.length} default medications.`)

  console.log('Seeding CRI medications...')
  for (const cri of criMedications) {
    await prisma.criMedication.upsert({
      where: {
        id: (await prisma.criMedication.findFirst({
          where: { name: cri.name },
          select: { id: true },
        }))?.id ?? 'nonexistent',
      },
      update: cri,
      create: cri,
    })
  }
  console.log(`Seeded ${criMedications.length} CRI medications.`)
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
