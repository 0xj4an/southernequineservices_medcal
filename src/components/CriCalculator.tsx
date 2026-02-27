"use client";

import { useState, useMemo } from "react";

interface CriMedication {
  id: string;
  name: string;
  category: string;
  loadingDoseMin: number;
  loadingDoseMax: number;
  rateMin: number | null;
  rateMax: number | null;
  rateUnit: string | null;
  concentration: number;
  concentrationUnit: string;
  notes: string | null;
}

interface CriCalculatorProps {
  criMedications: CriMedication[];
}

const DILUENTS = ["NaCl 0.9%", "Lactated Ringer's", "D5W", "Sterile Water"];
const COMMON_VOLUMES = [12, 60, 250, 500, 1000, 2000, 3000, 5000];

function getDoseStep(min: number, max: number): number {
  const range = max - min;
  if (range <= 0.01) return 0.0001;
  if (range <= 0.1) return 0.001;
  if (range <= 1) return 0.01;
  if (range <= 5) return 0.1;
  return 0.5;
}

/** Convert any rate unit to mg/kg/hr */
function toMgKgHr(rate: number, unit: string): number {
  switch (unit) {
    case "mcg/kg/min":
      return (rate / 1000) * 60;
    case "mcg/kg/hr":
      return rate / 1000;
    case "mg/kg/min":
      return rate * 60;
    case "mg/kg/hr":
    default:
      return rate;
  }
}

export default function CriCalculator({ criMedications }: CriCalculatorProps) {
  const [weightKg, setWeightKg] = useState(450);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLoadingDose, setSelectedLoadingDose] = useState<number | null>(null);
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const [bagVolume, setBagVolume] = useState(1000);
  const [durationHrs, setDurationHrs] = useState(12);
  const [diluent, setDiluent] = useState(DILUENTS[0]);

  const weightLbs = (weightKg * 2.205).toFixed(0);

  const grouped = useMemo(() => {
    const groups: Record<string, CriMedication[]> = {};
    for (const med of criMedications) {
      if (!groups[med.category]) groups[med.category] = [];
      groups[med.category].push(med);
    }
    const sorted: Record<string, CriMedication[]> = {};
    for (const key of Object.keys(groups).sort()) {
      sorted[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [criMedications]);

  const selectedMed = criMedications.find((m) => m.id === selectedId) || null;
  const hasRate = selectedMed?.rateMin != null && selectedMed?.rateMax != null && selectedMed?.rateUnit != null;

  function handleSelectMed(med: CriMedication) {
    if (selectedId === med.id) {
      setSelectedId(null);
      setSelectedLoadingDose(null);
      setSelectedRate(null);
    } else {
      setSelectedId(med.id);
      const midLoading = (med.loadingDoseMin + med.loadingDoseMax) / 2;
      setSelectedLoadingDose(parseFloat(midLoading.toFixed(4)));
      if (med.rateMin != null && med.rateMax != null) {
        const midRate = (med.rateMin + med.rateMax) / 2;
        setSelectedRate(parseFloat(midRate.toFixed(4)));
      } else {
        setSelectedRate(null);
      }
    }
  }

  // Loading dose calculation
  const loadingDose = selectedLoadingDose ?? 0;
  const loadingTotalMg = loadingDose * weightKg;
  const loadingVolume = selectedMed ? loadingTotalMg / selectedMed.concentration : 0;

  // CRI rate — normalize to mg/kg/hr for calculations
  const rate = selectedRate ?? 0;
  const rateUnit = selectedMed?.rateUnit ?? "mg/kg/hr";
  const rateInMgKgHr = toMgKgHr(rate, rateUnit);

  // Total drug needed over duration
  const totalDrugMg = rateInMgKgHr * weightKg * durationHrs;
  // Volume of drug to add to bag
  const drugToAddMl = selectedMed ? totalDrugMg / selectedMed.concentration : 0;
  // Drip rate
  const dripRateMlHr = bagVolume / durationHrs;

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Weight Input */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
        <label
          htmlFor="cri-weight"
          className="mb-2 block text-sm font-semibold text-[#1a2332] uppercase tracking-wide"
        >
          Horse Weight
        </label>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-[10rem] sm:max-w-xs">
            <input
              id="cri-weight"
              type="number"
              min={100}
              max={1000}
              step={10}
              value={weightKg}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setWeightKg(Math.min(1000, Math.max(50, val)));
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
          min={50}
          max={1000}
          step={10}
          value={weightKg}
          onChange={(e) => setWeightKg(parseInt(e.target.value, 10))}
          className="mt-3 w-full accent-[#c8a45a] sm:max-w-xs"
        />
      </div>

      {/* Result Panel */}
      {selectedMed && selectedLoadingDose !== null && (
        <div className="mb-6 rounded-xl border-2 border-[#c8a45a] bg-white shadow-lg overflow-hidden sm:mb-8">
          {/* Header */}
          <div className="bg-[#1a2332] px-4 py-3 flex items-start justify-between gap-2 sm:px-6 sm:py-4 sm:items-center">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              <h3 className="text-base font-bold text-white sm:text-xl break-words">
                {selectedMed.name}
              </h3>
              <span className="inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                {hasRate ? "IV CRI" : "IV Bolus"}
              </span>
            </div>
            <button
              onClick={() => { setSelectedId(null); setSelectedLoadingDose(null); setSelectedRate(null); }}
              className="shrink-0 text-gray-400 hover:text-white text-xl leading-none p-1"
            >
              &times;
            </button>
          </div>

          <div className="p-4 space-y-5 sm:p-6 sm:space-y-6">
            {/* ===== LOADING DOSE SECTION ===== */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Loading Dose (Bolus)
              </div>

              <div className="flex flex-col gap-1 mb-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
                  Dose
                </label>
                <span className="text-xs text-gray-500 sm:text-sm">
                  Range: {selectedMed.loadingDoseMin} — {selectedMed.loadingDoseMax} mg/kg
                </span>
              </div>

              {selectedMed.loadingDoseMin === selectedMed.loadingDoseMax ? (
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
                  <span className="text-2xl font-bold text-[#1a2332]">
                    {selectedMed.loadingDoseMin}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                  <span className="text-xs text-gray-400 ml-2">(fixed dose)</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {selectedMed.loadingDoseMin}
                    </span>
                    <input
                      type="range"
                      min={selectedMed.loadingDoseMin}
                      max={selectedMed.loadingDoseMax}
                      step={getDoseStep(selectedMed.loadingDoseMin, selectedMed.loadingDoseMax)}
                      value={selectedLoadingDose}
                      onChange={(e) => setSelectedLoadingDose(parseFloat(e.target.value))}
                      className="flex-1 accent-[#c8a45a] h-2"
                    />
                    <span className="text-xs text-gray-400 w-10">
                      {selectedMed.loadingDoseMax}
                    </span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-[#1a2332]">
                      {selectedLoadingDose}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">mg/kg</span>
                  </div>
                </>
              )}

              {/* Loading dose formula */}
              <div className="bg-gray-50 rounded-lg p-3 mt-3 sm:p-4">
                <div className="text-center text-xs text-gray-400">
                  ({selectedLoadingDose} &times; {weightKg}) &divide;{" "}
                  {selectedMed.concentration} ={" "}
                  <strong className="text-[#1a2332]">
                    {loadingVolume.toFixed(2)} ml
                  </strong>
                </div>
              </div>

              {/* Loading dose result */}
              <div className="bg-[#1a2332] rounded-xl px-4 py-3 text-center mt-3 sm:px-6 sm:py-4">
                <div className="text-xs font-semibold text-[#c8a45a] uppercase tracking-widest mb-1">
                  Loading Dose
                </div>
                <div className="text-2xl font-black text-white sm:text-4xl">
                  {loadingVolume.toFixed(2)}{" "}
                  <span className="text-lg font-bold sm:text-2xl">ml</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  IV bolus | Total: {loadingTotalMg.toFixed(4)} mg
                </div>
              </div>
            </div>

            {/* ===== CRI INFUSION SECTION (only if rate is set) ===== */}
            {hasRate && selectedRate !== null && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Constant Rate Infusion
                </div>

                {/* Rate Slider */}
                <div className="flex flex-col gap-1 mb-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
                    Rate
                  </label>
                  <span className="text-xs text-gray-500 sm:text-sm">
                    Range: {selectedMed.rateMin} — {selectedMed.rateMax} {selectedMed.rateUnit}
                  </span>
                </div>

                {selectedMed.rateMin === selectedMed.rateMax ? (
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
                    <span className="text-2xl font-bold text-[#1a2332]">
                      {selectedMed.rateMin}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{selectedMed.rateUnit}</span>
                    <span className="text-xs text-gray-400 ml-2">(fixed rate)</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-10 text-right">
                        {selectedMed.rateMin}
                      </span>
                      <input
                        type="range"
                        min={selectedMed.rateMin!}
                        max={selectedMed.rateMax!}
                        step={getDoseStep(selectedMed.rateMin!, selectedMed.rateMax!)}
                        value={selectedRate}
                        onChange={(e) => setSelectedRate(parseFloat(e.target.value))}
                        className="flex-1 accent-[#c8a45a] h-2"
                      />
                      <span className="text-xs text-gray-400 w-10">
                        {selectedMed.rateMax}
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-2xl font-bold text-[#1a2332]">
                        {selectedRate}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">{selectedMed.rateUnit}</span>
                    </div>
                    <div className="flex gap-2 justify-center mt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRate(selectedMed.rateMin!)}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:bg-[#c8a45a]/10 hover:border-[#c8a45a] transition-colors"
                      >
                        Min ({selectedMed.rateMin})
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRate(
                            parseFloat(
                              ((selectedMed.rateMin! + selectedMed.rateMax!) / 2).toFixed(4)
                            )
                          )
                        }
                        className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:bg-[#c8a45a]/10 hover:border-[#c8a45a] transition-colors"
                      >
                        Mid
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRate(selectedMed.rateMax!)}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 hover:bg-[#c8a45a]/10 hover:border-[#c8a45a] transition-colors"
                      >
                        Max ({selectedMed.rateMax})
                      </button>
                    </div>
                  </>
                )}

                {/* Infusion Setup: Duration, Bag, Diluent */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Infusion Setup
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Duration
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={72}
                          step={1}
                          value={durationHrs}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) setDurationHrs(val);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm font-medium text-[#1a2332] focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          hrs
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Volume (ml)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          step={1}
                          value={bagVolume}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) setBagVolume(val);
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm font-medium text-[#1a2332] focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          ml
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {COMMON_VOLUMES.map((vol) => (
                          <button
                            key={vol}
                            type="button"
                            onClick={() => setBagVolume(vol)}
                            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                              bagVolume === vol
                                ? "bg-[#c8a45a] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {vol}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Diluent
                      </label>
                      <select
                        value={diluent}
                        onChange={(e) => setDiluent(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-[#1a2332] focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
                      >
                        {DILUENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-gray-50 rounded-lg p-3 mt-3 sm:p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Calculation
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center mb-3 sm:grid-cols-4 sm:gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Rate</div>
                      <div className="text-sm font-semibold text-[#1a2332]">
                        {selectedRate} <span className="text-xs text-gray-400">{selectedMed.rateUnit}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Weight</div>
                      <div className="text-sm font-semibold text-[#1a2332]">
                        {weightKg} <span className="text-xs text-gray-400">kg</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="text-sm font-semibold text-[#1a2332]">
                        {durationHrs} <span className="text-xs text-gray-400">hrs</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Conc.</div>
                      <div className="text-sm font-semibold text-[#1a2332]">
                        {selectedMed.concentration} <span className="text-xs text-gray-400">{selectedMed.concentrationUnit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-400 leading-relaxed">
                    Total drug: {selectedRate} {selectedMed.rateUnit} &times; {weightKg} kg &times; {durationHrs} hrs
                    {rateUnit !== "mg/kg/hr" && " (converted to mg/kg/hr)"}
                    {" = "}
                    <strong className="text-[#1a2332]">{totalDrugMg.toFixed(2)} mg</strong>
                    <br />
                    Volume: {totalDrugMg.toFixed(2)} mg &divide; {selectedMed.concentration} {selectedMed.concentrationUnit}
                    {" = "}
                    <strong className="text-[#1a2332]">{drugToAddMl.toFixed(2)} ml</strong>
                  </div>
                </div>

                {/* CRI Results */}
                <div className="space-y-2 mt-3">
                  <div className="bg-[#c8a45a] rounded-xl px-4 py-4 text-center sm:px-6 sm:py-5">
                    <div className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
                      Add to {bagVolume} ml {diluent}
                    </div>
                    <div className="text-3xl font-black text-white sm:text-5xl">
                      {drugToAddMl.toFixed(2)}{" "}
                      <span className="text-xl font-bold sm:text-3xl">ml</span>
                    </div>
                    <div className="text-xs text-white/80 mt-1">
                      of {selectedMed.name} ({selectedMed.concentration} {selectedMed.concentrationUnit})
                    </div>
                  </div>
                  <div className="bg-[#1a2332] rounded-xl px-4 py-3 text-center sm:px-6 sm:py-4">
                    <div className="text-xs font-semibold text-[#c8a45a] uppercase tracking-widest mb-1">
                      Run at
                    </div>
                    <div className="text-2xl font-black text-white sm:text-4xl">
                      {dripRateMlHr.toFixed(1)}{" "}
                      <span className="text-lg font-bold sm:text-2xl">ml/hr</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      for {durationHrs} hours | Total: {totalDrugMg.toFixed(2)} mg
                    </div>
                    {rateUnit !== "mg/kg/hr" && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        ({rate} {rateUnit} = {rateInMgKgHr.toFixed(4)} mg/kg/hr)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
              const medHasRate = med.rateMin != null && med.rateMax != null && med.rateUnit != null;

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
                    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      medHasRate
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {medHasRate ? "IV CRI" : "IV Bolus"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    Loading: {med.loadingDoseMin === med.loadingDoseMax
                      ? `${med.loadingDoseMin} mg/kg`
                      : `${med.loadingDoseMin} — ${med.loadingDoseMax} mg/kg`}
                  </p>
                  {medHasRate && (
                    <p className="text-xs text-gray-500 sm:text-sm">
                      Rate: {med.rateMin === med.rateMax
                        ? `${med.rateMin}`
                        : `${med.rateMin} — ${med.rateMax}`}
                      {" "}{med.rateUnit}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Conc: {med.concentration} {med.concentrationUnit}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {criMedications.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-500">No CRI medications configured yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add CRI medications via the Admin dashboard.</p>
        </div>
      )}
    </div>
  );
}
