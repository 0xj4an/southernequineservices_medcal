import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientPath = resolve(__dirname, '../src/generated/prisma/client.ts')
const mod = await import(clientPath)
const PrismaClient = mod.PrismaClient

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})
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
]

async function main() {
  console.log('Seeding medications...')
  await prisma.medication.deleteMany({ where: { isDefault: true } })
  for (const med of medications) {
    await prisma.medication.create({ data: med })
  }
  console.log(`Seeded ${medications.length} medications.`)
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
