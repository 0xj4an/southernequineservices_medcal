'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import MedicationForm from '@/components/admin/MedicationForm'

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

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchMedications = useCallback(async () => {
    const res = await fetch('/api/medications')
    const data = await res.json()
    setMedications(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchMedications()
  }, [status, fetchMedications])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this medication?')) return
    setDeleting(id)
    await fetch(`/api/medications/${id}`, { method: 'DELETE' })
    await fetchMedications()
    setDeleting(null)
  }

  function handleEdit(med: Medication) {
    setEditing(med)
    setShowForm(true)
  }

  function handleAdd() {
    setEditing(null)
    setShowForm(true)
  }

  async function handleSave(data: Omit<Medication, 'id'>) {
    if (editing) {
      await fetch(`/api/medications/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setShowForm(false)
    setEditing(null)
    await fetchMedications()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const grouped = medications.reduce<Record<string, Medication[]>>((acc, med) => {
    if (!acc[med.category]) acc[med.category] = []
    acc[med.category].push(med)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#1a2332] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              Southern Equine Service
            </h1>
            <p className="text-xs text-[#c8a45a]">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              View Calculator
            </a>
            <span className="text-sm text-gray-400">
              {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1a2332]">
            Medications ({medications.length})
          </h2>
          <button
            onClick={handleAdd}
            className="rounded-md bg-[#c8a45a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b8943a] transition-colors"
          >
            + Add Medication
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1a2332]">
                  {editing ? 'Edit Medication' : 'Add Medication'}
                </h3>
                <button
                  onClick={() => { setShowForm(false); setEditing(null) }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  &times;
                </button>
              </div>
              <MedicationForm
                initial={editing}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null) }}
              />
            </div>
          </div>
        )}

        {/* Medications Table */}
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, meds]) => (
          <div key={category} className="mb-8">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#c8a45a]">
              {category}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Dose (mg/kg)</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Concentration</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Route</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.map((med) => (
                    <tr key={med.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#1a2332]">
                        {med.name}
                        {med.isDefault && (
                          <span className="ml-2 text-xs text-gray-400">(default)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {med.doseMin === med.doseMax
                          ? med.doseMin
                          : `${med.doseMin} - ${med.doseMax}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {med.concentration} {med.concentrationUnit}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                          {med.route}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(med)}
                          className="mr-2 text-[#c8a45a] hover:text-[#b8943a] font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          disabled={deleting === med.id}
                          className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {deleting === med.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {medications.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
            <p className="text-gray-500">No medications yet.</p>
            <button
              onClick={handleAdd}
              className="mt-3 text-[#c8a45a] hover:text-[#b8943a] font-medium"
            >
              Add your first medication
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
