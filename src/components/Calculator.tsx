"use client";

import { useState, useMemo } from "react";
import type { Medication } from "@/types";

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
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Weight Input */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
        <label
          htmlFor="weight"
          className="mb-2 block text-sm font-semibold text-[#1a2332] uppercase tracking-wide"
        >
          Horse Weight
        </label>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-[10rem] sm:max-w-xs">
            <input
              id="weight"
              type="number"
              min={25}
              max={2000}
              step={5}
              value={weightKg}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setWeightKg(Math.min(2000, Math.max(25, val)));
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 text-lg font-medium text-[#1a2332] focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30 sm:px-4 sm:pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 sm:right-4">
              kg
            </span>
          </div>
          <span className="text-sm text-gray-500">({weightLbs} lbs)</span>
        </div>
        <input
          type="range"
          min={25}
          max={2000}
          step={5}
          value={weightKg}
          onChange={(e) => setWeightKg(parseInt(e.target.value, 10))}
          className="mt-3 w-full accent-[#c8a45a] sm:max-w-xs"
        />
      </div>

      {/* Result Panel - shows when medication is selected */}
      {selectedMed && selectedDose !== null && (
        <div className="mb-6 rounded-xl border-2 border-[#c8a45a] bg-white shadow-lg overflow-hidden sm:mb-8">
          {/* Header */}
          <div className="bg-[#1a2332] px-4 py-3 flex items-start justify-between gap-2 sm:px-6 sm:py-4 sm:items-center">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              <h3 className="text-base font-bold text-white sm:text-xl break-words">
                {selectedMed.name}
              </h3>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getRouteBadge(selectedMed.route)}`}
              >
                {selectedMed.route}
              </span>
            </div>
            <button
              onClick={() => { setSelectedId(null); setSelectedDose(null); }}
              className="shrink-0 text-gray-400 hover:text-white text-xl leading-none p-1"
            >
              &times;
            </button>
          </div>

          <div className="p-4 space-y-5 sm:p-6 sm:space-y-6">
            {/* Dose Selector */}
            <div>
              <div className="flex flex-col gap-1 mb-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
                  Dose
                </label>
                <span className="text-xs text-gray-500 sm:text-sm">
                  Range: {selectedMed.doseMin} — {selectedMed.doseMax} mg/kg
                </span>
              </div>

              {selectedMed.doseMin === selectedMed.doseMax ? (
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
                  <span className="text-2xl font-bold text-[#1a2332]">
                    {selectedMed.doseMin}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                  <span className="text-xs text-gray-400 ml-2">(fixed dose)</span>
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
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Calculation
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4 sm:gap-4">
                <div>
                  <div className="text-xs text-gray-500">Dose</div>
                  <div className="text-sm font-semibold text-[#1a2332] sm:text-lg">
                    {selectedDose} <span className="text-xs text-gray-400">mg/kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Weight</div>
                  <div className="text-sm font-semibold text-[#1a2332] sm:text-lg">
                    {weightKg} <span className="text-xs text-gray-400">kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Conc.</div>
                  <div className="text-sm font-semibold text-[#1a2332] sm:text-lg">
                    {selectedMed.concentration}{" "}
                    <span className="hidden text-xs text-gray-400 sm:inline">
                      {selectedMed.concentrationUnit}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 mb-3 leading-relaxed">
                ({selectedDose} &times; {weightKg}) &divide;{" "}
                {selectedMed.concentration} ={" "}
                <strong className="text-[#1a2332]">
                  {formatVolume(volume, selectedMed.concentrationUnit)} {unit}
                </strong>
              </div>
            </div>

            {/* Final Result */}
            <div className="bg-[#c8a45a] rounded-xl px-4 py-4 text-center sm:px-6 sm:py-5">
              <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
                Administer
              </div>
              <div className="text-3xl font-black text-white sm:text-5xl">
                {formatVolume(volume, selectedMed.concentrationUnit)}{" "}
                <span className="text-xl font-bold sm:text-3xl">{unit}</span>
              </div>
              <div className="text-xs text-white/80 mt-1 sm:text-sm">
                via {selectedMed.route} | Total: {totalMg.toFixed(1)} mg
              </div>
            </div>

            {/* Notes */}
            {selectedMed.notes && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 border border-amber-200">
                <span className="font-semibold">Note:</span> {selectedMed.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medication Grid */}
      {Object.entries(grouped).map(([category, meds]) => (
        <div key={category} className="mb-6 sm:mb-8">
          <h2 className="mb-3 border-b-2 border-[#c8a45a] pb-2 text-base font-bold text-[#1a2332] uppercase tracking-wide sm:mb-4 sm:text-lg">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {meds.map((med) => {
              const isSelected = selectedId === med.id;

              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelectMed(med)}
                  className={`w-full cursor-pointer rounded-xl border-2 p-3 text-left transition-all active:scale-[0.98] sm:p-4 ${
                    isSelected
                      ? "border-[#c8a45a] bg-[#c8a45a]/5 shadow-md"
                      : "border-gray-200 bg-white hover:border-[#c8a45a]/50 hover:shadow-sm"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1a2332] sm:text-base">{med.name}</h3>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getRouteBadge(med.route)}`}
                    >
                      {med.route}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 sm:text-sm">
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
