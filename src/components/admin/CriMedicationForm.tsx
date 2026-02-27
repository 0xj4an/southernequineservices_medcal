'use client'

import { useState, FormEvent } from 'react'

interface CriMedication {
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

interface Props {
  initial: CriMedication | null
  onSave: (data: Omit<CriMedication, 'id'>) => void
  onCancel: () => void
}

const CATEGORIES = ['Analgesic', 'Sedation', 'Antibiotic', 'Induction', 'Other']
const RATE_UNITS = ['mg/kg/hr', 'mg/kg/min', 'mcg/kg/hr', 'mcg/kg/min']

export default function CriMedicationForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [loadingDoseMin, setLoadingDoseMin] = useState(initial?.loadingDoseMin?.toString() ?? '')
  const [loadingDoseMax, setLoadingDoseMax] = useState(initial?.loadingDoseMax?.toString() ?? '')
  const [hasRate, setHasRate] = useState(initial?.rateMin != null)
  const [rateMin, setRateMin] = useState(initial?.rateMin?.toString() ?? '')
  const [rateMax, setRateMax] = useState(initial?.rateMax?.toString() ?? '')
  const [rateUnit, setRateUnit] = useState(initial?.rateUnit ?? RATE_UNITS[0])
  const [concentration, setConcentration] = useState(initial?.concentration?.toString() ?? '')
  const [concentrationUnit] = useState(initial?.concentrationUnit ?? 'mg/ml')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await onSave({
      name,
      category,
      loadingDoseMin: parseFloat(loadingDoseMin),
      loadingDoseMax: parseFloat(loadingDoseMax),
      rateMin: hasRate ? parseFloat(rateMin) : null,
      rateMax: hasRate ? parseFloat(rateMax) : null,
      rateUnit: hasRate ? rateUnit : null,
      concentration: parseFloat(concentration),
      concentrationUnit,
      notes: notes || null,
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
          placeholder="e.g., Lidocaine"
        />
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Loading Dose Min (mg/kg) *</label>
          <input
            type="number"
            step="0.001"
            value={loadingDoseMin}
            onChange={(e) => setLoadingDoseMin(e.target.value)}
            required
            className={inputClass}
            placeholder="e.g., 1.3"
          />
        </div>
        <div>
          <label className={labelClass}>Loading Dose Max (mg/kg) *</label>
          <input
            type="number"
            step="0.001"
            value={loadingDoseMax}
            onChange={(e) => setLoadingDoseMax(e.target.value)}
            required
            className={inputClass}
            placeholder="e.g., 1.3"
          />
        </div>
      </div>

      {/* CRI Rate toggle */}
      <div className="rounded-lg border border-gray-200 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasRate}
            onChange={(e) => setHasRate(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#c8a45a] accent-[#c8a45a]"
          />
          <span className="text-sm font-medium text-gray-700">
            Include CRI rate (continuous infusion after loading dose)
          </span>
        </label>

        {hasRate && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rate Min *</label>
                <input
                  type="number"
                  step="0.001"
                  value={rateMin}
                  onChange={(e) => setRateMin(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="e.g., 3.0"
                />
              </div>
              <div>
                <label className={labelClass}>Rate Max *</label>
                <input
                  type="number"
                  step="0.001"
                  value={rateMax}
                  onChange={(e) => setRateMax(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="e.g., 6.0"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Rate Unit *</label>
              <select
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value)}
                className={inputClass}
              >
                {RATE_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Concentration (mg/ml) *</label>
        <input
          type="number"
          step="0.01"
          value={concentration}
          onChange={(e) => setConcentration(e.target.value)}
          required
          className={inputClass}
          placeholder="e.g., 20"
        />
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
          {submitting ? 'Saving...' : initial ? 'Update CRI Medication' : 'Add CRI Medication'}
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
