'use client'

import { useState, FormEvent } from 'react'

interface Medication {
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

interface Props {
  initial: Medication | null
  onSave: (data: Omit<Medication, 'id'>) => void
  onCancel: () => void
}

const CATEGORIES = ['Analgesic', 'Antibiotic', 'Induction']
const ROUTES = ['IV', 'IM', 'PO', 'SQ']
const UNITS = ['mg/ml', 'mg/tablet']

export default function MedicationForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [doseMin, setDoseMin] = useState(initial?.doseMin?.toString() ?? '')
  const [doseMax, setDoseMax] = useState(initial?.doseMax?.toString() ?? '')
  const [concentration, setConcentration] = useState(
    initial?.concentration?.toString() ?? ''
  )
  const [concentrationUnit, setConcentrationUnit] = useState(
    initial?.concentrationUnit ?? UNITS[0]
  )
  const [route, setRoute] = useState(initial?.route ?? ROUTES[0])
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await onSave({
      name,
      category,
      doseMin: parseFloat(doseMin),
      doseMax: parseFloat(doseMax),
      concentration: parseFloat(concentration),
      concentrationUnit,
      route,
      notes: notes || null,
      isDefault: initial?.isDefault ?? false,
    })
    setSubmitting(false)
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#c8a45a] focus:outline-none focus:ring-1 focus:ring-[#c8a45a]'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          placeholder="e.g., Ketamine"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Route *</label>
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            className={inputClass}
          >
            {ROUTES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Dose Min (mg/kg) *</label>
          <input
            type="number"
            step="0.01"
            value={doseMin}
            onChange={(e) => setDoseMin(e.target.value)}
            required
            className={inputClass}
            placeholder="e.g., 2.2"
          />
        </div>
        <div>
          <label className={labelClass}>Dose Max (mg/kg) *</label>
          <input
            type="number"
            step="0.01"
            value={doseMax}
            onChange={(e) => setDoseMax(e.target.value)}
            required
            className={inputClass}
            placeholder="e.g., 4.4"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Concentration *</label>
          <input
            type="number"
            step="0.01"
            value={concentration}
            onChange={(e) => setConcentration(e.target.value)}
            required
            className={inputClass}
            placeholder="e.g., 100"
          />
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <select
            value={concentrationUnit}
            onChange={(e) => setConcentrationUnit(e.target.value)}
            className={inputClass}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Clinical notes, warnings, etc."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-md bg-[#c8a45a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b8943a] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initial ? 'Update Medication' : 'Add Medication'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
