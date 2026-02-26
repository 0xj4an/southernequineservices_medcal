"use client";

import { useState, useMemo } from "react";

interface Medication {
  id: string;
  name: string;
  category: string;
  doseMin: number;
  doseMax: number;
  concentration: number;
  concentrationUnit: string;
  route: string;
  notes: string | null;
}

interface CalculatorProps {
  medications: Medication[];
}

const routeColors: Record<string, string> = {
  IV: "bg-blue-100 text-blue-800",
  IM: "bg-green-100 text-green-800",
  PO: "bg-amber-100 text-amber-800",
  SQ: "bg-purple-100 text-purple-800",
};

function getRouteBadge(route: string) {
  return routeColors[route] || "bg-gray-100 text-gray-800";
}

function getResultUnit(concentrationUnit: string): string {
  return concentrationUnit === "mg/tablet" ? "tablets" : "ml";
}

export default function Calculator({ medications }: CalculatorProps) {
  const [weightKg, setWeightKg] = useState(450);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDose, setSelectedDose] = useState<number | null>(null);

  const weightLbs = (weightKg * 2.205).toFixed(0);

  const grouped = useMemo(() => {
    const groups: Record<string, Medication[]> = {};
    for (const med of medications) {
      if (!groups[med.category]) groups[med.category] = [];
      groups[med.category].push(med);
    }
    const sorted: Record<string, Medication[]> = {};
    for (const key of Object.keys(groups).sort()) {
      sorted[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [medications]);

  const selectedMed = medications.find((m) => m.id === selectedId) || null;

  // When selecting a new medication, set dose to midpoint
  function handleSelectMed(med: Medication) {
    if (selectedId === med.id) {
      setSelectedId(null);
      setSelectedDose(null);
    } else {
      setSelectedId(med.id);
      // Default to midpoint of dose range
      const mid = (med.doseMin + med.doseMax) / 2;
      setSelectedDose(parseFloat(mid.toFixed(3)));
    }
  }

  // Calculate result
  const dose = selectedDose ?? 0;
  const totalMg = dose * weightKg;
  const volume =
    selectedMed ? totalMg / selectedMed.concentration : 0;
  const unit = selectedMed ? getResultUnit(selectedMed.concentrationUnit) : "ml";

  function formatVolume(val: number, concUnit: string): string {
    if (concUnit === "mg/tablet") {
      return (Math.round(val * 2) / 2).toString();
    }
    return val.toFixed(2);
  }

  // Determine step for dose slider based on range
  function getDoseStep(min: number, max: number): number {
    const range = max - min;
    if (range <= 0.1) return 0.001;
    if (range <= 1) return 0.01;
    if (range <= 5) return 0.1;
    return 0.5;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Weight Input */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="weight"
          className="mb-2 block text-sm font-semibold text-[#1a2332] uppercase tracking-wide"
        >
          Peso del Caballo
        </label>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <input
              id="weight"
              type="number"
              min={100}
              max={1000}
              step={10}
              value={weightKg}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setWeightKg(Math.min(1000, Math.max(50, val)));
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-lg font-medium text-[#1a2332] focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
              kg
            </span>
          </div>
          <span className="text-sm text-gray-500">({weightLbs} lbs)</span>
        </div>
        <input
          type="range"
          min={50}
          max={1000}
          step={10}
          value={weightKg}
          onChange={(e) => setWeightKg(parseInt(e.target.value, 10))}
          className="mt-3 w-full max-w-xs accent-[#c8a45a]"
        />
      </div>

      {/* Result Panel - shows when medication is selected */}
      {selectedMed && selectedDose !== null && (
        <div className="mb-8 rounded-xl border-2 border-[#c8a45a] bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a2332] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">
                {selectedMed.name}
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getRouteBadge(selectedMed.route)}`}
              >
                {selectedMed.route}
              </span>
            </div>
            <button
              onClick={() => { setSelectedId(null); setSelectedDose(null); }}
              className="text-gray-400 hover:text-white text-xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Dose Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
                  Dosis
                </label>
                <span className="text-sm text-gray-500">
                  Rango: {selectedMed.doseMin} — {selectedMed.doseMax} mg/kg
                </span>
              </div>

              {selectedMed.doseMin === selectedMed.doseMax ? (
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
                  <span className="text-2xl font-bold text-[#1a2332]">
                    {selectedMed.doseMin}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                  <span className="text-xs text-gray-400 ml-2">(dosis fija)</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {selectedMed.doseMin}
                    </span>
                    <input
                      type="range"
                      min={selectedMed.doseMin}
                      max={selectedMed.doseMax}
                      step={getDoseStep(selectedMed.doseMin, selectedMed.doseMax)}
                      value={selectedDose}
                      onChange={(e) => setSelectedDose(parseFloat(e.target.value))}
                      className="flex-1 accent-[#c8a45a] h-2"
                    />
                    <span className="text-xs text-gray-400 w-10">
                      {selectedMed.doseMax}
                    </span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-[#1a2332]">
                      {selectedDose}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                  </div>
                  {/* Quick dose buttons */}
                  <div className="flex gap-2 justify-center mt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDose(selectedMed.doseMin)}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:bg-[#c8a45a]/10 hover:border-[#c8a45a] transition-colors"
                    >
                      Min ({selectedMed.doseMin})
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDose(
                          parseFloat(
                            ((selectedMed.doseMin + selectedMed.doseMax) / 2).toFixed(3)
                          )
                        )
                      }
                      className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:bg-[#c8a45a]/10 hover:border-[#c8a45a] transition-colors"
                    >
                      Mid
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDose(selectedMed.doseMax)}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:bg-[#c8a45a]/10 hover:border-[#c8a45a] transition-colors"
                    >
                      Max ({selectedMed.doseMax})
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Calculation Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Calculo
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-xs text-gray-500">Dosis</div>
                  <div className="text-lg font-semibold text-[#1a2332]">
                    {selectedDose} <span className="text-xs text-gray-400">mg/kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Peso</div>
                  <div className="text-lg font-semibold text-[#1a2332]">
                    {weightKg} <span className="text-xs text-gray-400">kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Concentracion</div>
                  <div className="text-lg font-semibold text-[#1a2332]">
                    {selectedMed.concentration}{" "}
                    <span className="text-xs text-gray-400">
                      {selectedMed.concentrationUnit}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 mb-3">
                ({selectedDose} mg/kg &times; {weightKg} kg) &divide;{" "}
                {selectedMed.concentration} {selectedMed.concentrationUnit} ={" "}
                <strong className="text-[#1a2332]">
                  {formatVolume(volume, selectedMed.concentrationUnit)} {unit}
                </strong>
              </div>
            </div>

            {/* Final Result */}
            <div className="bg-[#c8a45a] rounded-xl px-6 py-5 text-center">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
                Administrar
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white">
                {formatVolume(volume, selectedMed.concentrationUnit)}{" "}
                <span className="text-2xl sm:text-3xl font-bold">{unit}</span>
              </div>
              <div className="text-sm text-white/80 mt-1">
                via {selectedMed.route} | Total: {totalMg.toFixed(1)} mg
              </div>
            </div>

            {/* Notes */}
            {selectedMed.notes && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 border border-amber-200">
                <span className="font-semibold">Nota:</span> {selectedMed.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medication Grid */}
      {Object.entries(grouped).map(([category, meds]) => (
        <div key={category} className="mb-8">
          <h2 className="mb-4 border-b-2 border-[#c8a45a] pb-2 text-lg font-bold text-[#1a2332] uppercase tracking-wide">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {meds.map((med) => {
              const isSelected = selectedId === med.id;

              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelectMed(med)}
                  className={`w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#c8a45a] bg-[#c8a45a]/5 shadow-md"
                      : "border-gray-200 bg-white hover:border-[#c8a45a]/50 hover:shadow-sm"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#1a2332]">{med.name}</h3>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getRouteBadge(med.route)}`}
                    >
                      {med.route}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {med.doseMin === med.doseMax
                      ? `${med.doseMin} mg/kg`
                      : `${med.doseMin} — ${med.doseMax} mg/kg`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Conc: {med.concentration} {med.concentrationUnit}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {medications.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">No medications configured yet.</p>
        </div>
      )}
    </div>
  );
}
