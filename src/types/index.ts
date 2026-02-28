export interface Medication {
  id: string
  name: string
  category: string
  doseMin: number
  doseMax: number
  concentration: number
  concentrationUnit: string
  route: string
  notes: string | null
  isDefault: boolean
}

export interface CriMedication {
  id: string
  name: string
  category: string
  loadingDoseMin: number
  loadingDoseMax: number
  rateMin: number | null
  rateMax: number | null
  rateUnit: string | null
  concentration: number
  concentrationUnit: string
  notes: string | null
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export interface ProtocolItem {
  id: string
  type: 'bolus' | 'cri'
  name: string
  route: string
  dose: string
  result: string
  totalMg: string
  notes?: string
}

export const MEDICATION_CATEGORIES = ['Analgesic', 'Sedation', 'Antibiotic', 'Induction', 'Other'] as const
export const ROUTES = ['IV', 'IM', 'PO', 'SQ'] as const
export const CONCENTRATION_UNITS = ['mg/ml', 'mg/tablet'] as const
export const RATE_UNITS = ['mg/kg/hr', 'mg/kg/min', 'mcg/kg/hr', 'mcg/kg/min'] as const
