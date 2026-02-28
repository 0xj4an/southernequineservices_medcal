"use client";

import { useMemo, useState } from "react";
import Calculator from "./Calculator";
import CriCalculator from "./CriCalculator";
import type { Medication, CriMedication, ProtocolItem, PatientInfo, Procedure } from "@/types";

interface Props {
  medications: Medication[];
  criMedications: CriMedication[];
  procedures: Procedure[];
}

const STEPS = [
  {
    key: "info",
    label: "Info",
    number: 1,
    hint: "Enter patient and procedure details.",
  },
  {
    key: "bolus",
    label: "Bolus",
    number: 2,
    hint: "Select a medication, adjust the dose, then tap '+ Add to Protocol'.",
  },
  {
    key: "cri",
    label: "CRI",
    number: 3,
    hint: "Configure constant rate infusions. Add each to your protocol.",
  },
  {
    key: "summary",
    label: "Summary",
    number: 4,
    hint: "Review all medications before administering.",
  },
] as const;

type Step = (typeof STEPS)[number]["key"];

export default function CalculatorWrapper({ medications, criMedications, procedures }: Props) {
  const [step, setStep] = useState<Step>("info");
  const [protocol, setProtocol] = useState<ProtocolItem[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  // Patient info state
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    surgeonName: "",
    horseName: "",
    procedureName: "",
    weightKg: 450,
  });

  const [customProcedure, setCustomProcedure] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const currentIndex = STEPS.findIndex((s) => s.key === step);
  const currentStep = STEPS[currentIndex];

  const canProceed =
    patientInfo.surgeonName.trim() !== "" &&
    patientInfo.horseName.trim() !== "" &&
    patientInfo.procedureName.trim() !== "" &&
    patientInfo.weightKg >= 25;

  function addToProtocol(item: ProtocolItem) {
    setProtocol((prev) => [...prev, item]);
    setLastAdded(item.name);
    setTimeout(() => setLastAdded(null), 2000);
  }

  function removeFromProtocol(id: string) {
    setProtocol((prev) => prev.filter((p) => p.id !== id));
  }

  function clearProtocol() {
    setProtocol([]);
  }

  async function handleSaveRecord() {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/medication-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surgeonName: patientInfo.surgeonName.trim(),
          horseName: patientInfo.horseName.trim(),
          procedureName: patientInfo.procedureName.trim(),
          weightKg: patientInfo.weightKg,
          protocol,
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      setSaveSuccess(true);
    } catch {
      setSaveError("Failed to save record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleNewRecord() {
    setProtocol([]);
    setPatientInfo({ surgeonName: "", horseName: "", procedureName: "", weightKg: 450 });
    setCustomProcedure(false);
    setSaveSuccess(false);
    setSaveError(null);
    setStep("info");
  }

  const protocolMedIds = useMemo(
    () => new Set(protocol.map((p) => p.medId)),
    [protocol]
  );

  const bolusItems = protocol.filter((p) => p.type === "bolus");
  const criItems = protocol.filter((p) => p.type === "cri");
  const weightLbs = (patientInfo.weightKg * 2.205).toFixed(0);

  return (
    <div>
      {/* Step Indicator */}
      <div className="bg-[#1a2332]/95 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 py-3 sm:gap-3">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1.5 sm:gap-3">
                {i > 0 && (
                  <div
                    className={`h-px w-4 sm:w-10 ${
                      currentIndex >= i ? "bg-[#c8a45a]" : "bg-white/20"
                    }`}
                  />
                )}
                <button
                  onClick={() => {
                    // Don't allow jumping past info if not filled
                    if (s.key !== "info" && !canProceed) return;
                    setStep(s.key);
                  }}
                  className="flex items-center gap-1 sm:gap-2 group"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-8 sm:w-8 sm:text-sm ${
                      step === s.key
                        ? "bg-[#c8a45a] text-white"
                        : currentIndex > i
                          ? "bg-[#c8a45a]/30 text-[#c8a45a]"
                          : "bg-white/10 text-gray-400 group-hover:bg-white/20"
                    }`}
                  >
                    {currentIndex > i ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.number
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold transition-colors sm:text-base ${
                      step === s.key
                        ? "text-[#c8a45a]"
                        : "text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              </div>
            ))}

            {/* Protocol counter pill */}
            {protocol.length > 0 && (
              <button
                onClick={() => setStep("summary")}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-[#c8a45a] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#b8943a] active:scale-95"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {protocol.length}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instruction banner */}
      <div className="bg-[#f0ebe0] border-b border-[#c8a45a]/20">
        <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-6 lg:px-8">
          <p className="text-xs text-[#1a2332]/70 sm:text-sm">
            <span className="font-semibold text-[#1a2332]">
              Step {currentStep.number}:
            </span>{" "}
            {currentStep.hint}
          </p>
        </div>
      </div>

      {/* "Added!" toast */}
      {lastAdded && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in rounded-lg bg-[#1a2332] px-4 py-3 text-sm font-medium text-white shadow-xl">
          <span className="text-[#c8a45a] mr-1.5">&#10003;</span>
          {lastAdded} added to protocol
        </div>
      )}

      {/* ===== STEP 1: PATIENT INFO ===== */}
      {step === "info" && (
        <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Surgeon */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <label htmlFor="surgeon" className="mb-2 block text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
                Surgeon <span className="text-red-500">*</span>
              </label>
              <input
                id="surgeon"
                type="text"
                placeholder="Name of surgeon"
                value={patientInfo.surgeonName}
                onChange={(e) => setPatientInfo((p) => ({ ...p, surgeonName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-[#1a2332] placeholder:text-gray-400 focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
              />
            </div>

            {/* Horse Name */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <label htmlFor="horse" className="mb-2 block text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
                Horse Name <span className="text-red-500">*</span>
              </label>
              <input
                id="horse"
                type="text"
                placeholder="Name of horse"
                value={patientInfo.horseName}
                onChange={(e) => setPatientInfo((p) => ({ ...p, horseName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-[#1a2332] placeholder:text-gray-400 focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
              />
            </div>

            {/* Procedure */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <label htmlFor="procedure" className="mb-2 block text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
                Procedure <span className="text-red-500">*</span>
              </label>
              <select
                id="procedure"
                value={customProcedure ? "__other__" : patientInfo.procedureName}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__other__") {
                    setCustomProcedure(true);
                    setPatientInfo((p) => ({ ...p, procedureName: "" }));
                  } else {
                    setCustomProcedure(false);
                    setPatientInfo((p) => ({ ...p, procedureName: val }));
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-[#1a2332] focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
              >
                <option value="" disabled>Select a procedure</option>
                {procedures.map((proc) => (
                  <option key={proc.id} value={proc.name}>{proc.name}</option>
                ))}
                <option value="__other__">Other...</option>
              </select>
              {customProcedure && (
                <input
                  type="text"
                  placeholder="Enter procedure name"
                  value={patientInfo.procedureName}
                  onChange={(e) => setPatientInfo((p) => ({ ...p, procedureName: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-medium text-[#1a2332] placeholder:text-gray-400 focus:border-[#c8a45a] focus:outline-none focus:ring-2 focus:ring-[#c8a45a]/30"
                  autoFocus
                />
              )}
            </div>

            {/* Weight */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <label htmlFor="weight" className="mb-2 block text-sm font-semibold text-[#1a2332] uppercase tracking-wide">
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
                    value={patientInfo.weightKg}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setPatientInfo((p) => ({ ...p, weightKg: Math.min(2000, Math.max(25, val)) }));
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
                value={patientInfo.weightKg}
                onChange={(e) => setPatientInfo((p) => ({ ...p, weightKg: parseInt(e.target.value, 10) }))}
                className="mt-3 w-full accent-[#c8a45a] sm:max-w-xs"
              />
            </div>

            {/* Missing fields message */}
            {!canProceed && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-800">
                  Please fill in the following to continue:
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm text-amber-700">
                  {!patientInfo.surgeonName.trim() && <li>Surgeon name</li>}
                  {!patientInfo.horseName.trim() && <li>Horse name</li>}
                  {!patientInfo.procedureName.trim() && <li>Procedure</li>}
                </ul>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={() => setStep("bolus")}
              disabled={!canProceed}
              className={`w-full rounded-xl border-2 px-6 py-4 text-base font-bold transition-all sm:text-lg ${
                canProceed
                  ? "border-[#1a2332] bg-[#1a2332] text-white hover:bg-[#1a2332]/90 active:scale-[0.99]"
                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue to Bolus &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 2: BOLUS ===== */}
      {step === "bolus" && (
        <>
          <Calculator medications={medications} weightKg={patientInfo.weightKg} onAddToProtocol={addToProtocol} protocolMedIds={protocolMedIds} protocolItems={protocol} />
          <div className="mx-auto max-w-6xl px-3 pb-6 space-y-3 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep("cri")}
              className="w-full rounded-xl border-2 border-[#1a2332] bg-[#1a2332] px-6 py-4 text-base font-bold text-white transition-all hover:bg-[#1a2332]/90 active:scale-[0.99] sm:text-lg"
            >
              Continue to CRI &rarr;
            </button>
            {criMedications.length === 0 && protocol.length > 0 && (
              <button
                onClick={() => setStep("summary")}
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-bold text-[#1a2332] transition-all hover:bg-gray-50 active:scale-[0.99]"
              >
                Skip to Summary ({protocol.length})
              </button>
            )}
            <button
              onClick={() => setStep("info")}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-bold text-[#1a2332] transition-all hover:bg-gray-50 active:scale-[0.99]"
            >
              &larr; Back to Patient Info
            </button>
          </div>
        </>
      )}

      {/* ===== STEP 3: CRI ===== */}
      {step === "cri" && (
        <>
          <CriCalculator criMedications={criMedications} weightKg={patientInfo.weightKg} onAddToProtocol={addToProtocol} protocolMedIds={protocolMedIds} protocolItems={protocol} />
          <div className="mx-auto max-w-6xl px-3 pb-6 space-y-3 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep("summary")}
              className="w-full rounded-xl border-2 border-[#1a2332] bg-[#1a2332] px-6 py-4 text-base font-bold text-white transition-all hover:bg-[#1a2332]/90 active:scale-[0.99] sm:text-lg"
            >
              View Summary &rarr;
              {protocol.length > 0 && (
                <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#c8a45a] text-sm">
                  {protocol.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setStep("bolus")}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-bold text-[#1a2332] transition-all hover:bg-gray-50 active:scale-[0.99]"
            >
              &larr; Back to Bolus
            </button>
          </div>
        </>
      )}

      {/* ===== STEP 4: SUMMARY ===== */}
      {step === "summary" && (
        <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Save Success State */}
          {saveSuccess ? (
            <div className="space-y-6">
              <div className="rounded-xl border-2 border-green-300 bg-green-50 py-12 text-center sm:py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-4 text-xl font-bold text-green-800">
                  Record Saved
                </p>
                <p className="mt-1 text-sm text-green-600">
                  {patientInfo.horseName} &mdash; {protocol.length} medication{protocol.length !== 1 && "s"} recorded
                </p>
              </div>
              <button
                onClick={handleNewRecord}
                className="w-full rounded-xl border-2 border-[#1a2332] bg-[#1a2332] px-6 py-4 text-base font-bold text-white transition-all hover:bg-[#1a2332]/90 active:scale-[0.99] sm:text-lg"
              >
                New Record
              </button>
            </div>
          ) : protocol.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-3 text-base font-medium text-gray-500">
                No medications in protocol yet
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Go back and tap &quot;+ Add to Protocol&quot; on each medication you need.
              </p>
              <button
                onClick={() => setStep("bolus")}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c8a45a] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#b8943a] active:scale-95"
              >
                &larr; Start with Bolus
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Patient Info Summary */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="border-b-2 border-[#c8a45a] pb-2 text-base font-bold text-[#1a2332] uppercase tracking-wide">
                    Patient Information
                  </h3>
                  <button
                    onClick={() => setStep("info")}
                    className="text-xs font-medium text-[#c8a45a] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Surgeon</span>
                    <p className="font-medium text-[#1a2332]">{patientInfo.surgeonName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Horse</span>
                    <p className="font-medium text-[#1a2332]">{patientInfo.horseName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Procedure</span>
                    <p className="font-medium text-[#1a2332]">{patientInfo.procedureName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Weight</span>
                    <p className="font-medium text-[#1a2332]">
                      {patientInfo.weightKg} kg ({weightLbs} lbs)
                    </p>
                  </div>
                </div>
              </div>

              {/* Bolus Medications */}
              {bolusItems.length > 0 && (
                <div>
                  <h3 className="mb-3 border-b-2 border-[#c8a45a] pb-2 text-base font-bold text-[#1a2332] uppercase tracking-wide">
                    Bolus Medications ({bolusItems.length})
                  </h3>
                  <div className="space-y-2">
                    {bolusItems.map((item, i) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a2332] text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1a2332] text-sm sm:text-base">
                              {item.name}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                              {item.route}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.dose} &middot; {item.totalMg}
                          </div>
                          <div className="mt-1 text-base font-black text-[#c8a45a]">
                            {item.result}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromProtocol(item.id)}
                          className="shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CRI Medications */}
              {criItems.length > 0 && (
                <div>
                  <h3 className="mb-3 border-b-2 border-[#c8a45a] pb-2 text-base font-bold text-[#1a2332] uppercase tracking-wide">
                    CRI Medications ({criItems.length})
                  </h3>
                  <div className="space-y-2">
                    {criItems.map((item, i) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a2332] text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1a2332] text-sm sm:text-base">
                              {item.name}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                              CRI
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.dose} &middot; {item.totalMg}
                          </div>
                          <div className="mt-1 text-base font-black text-[#c8a45a]">
                            {item.result}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromProtocol(item.id)}
                          className="shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total summary bar */}
              <div className="rounded-xl bg-[#1a2332] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#c8a45a] uppercase tracking-widest">
                      Protocol Total
                    </div>
                    <div className="text-2xl font-black text-white mt-0.5">
                      {protocol.length} medication{protocol.length !== 1 && "s"}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {bolusItems.length > 0 && `${bolusItems.length} bolus`}
                      {bolusItems.length > 0 && criItems.length > 0 && " + "}
                      {criItems.length > 0 && `${criItems.length} CRI`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearProtocol}
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-red-400 hover:text-red-400"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Save Error */}
              {saveError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {saveError}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveRecord}
                disabled={saving}
                className="w-full rounded-xl border-2 border-[#c8a45a] bg-[#c8a45a] px-6 py-4 text-base font-bold text-white transition-all hover:bg-[#b8943a] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed sm:text-lg"
              >
                {saving ? "Saving..." : "Save Record"}
              </button>

              {/* Navigation */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep("bolus")}
                  className="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-bold text-[#1a2332] transition-all hover:bg-gray-50 active:scale-[0.99]"
                >
                  &larr; Bolus
                </button>
                <button
                  onClick={() => setStep("cri")}
                  className="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-sm font-bold text-[#1a2332] transition-all hover:bg-gray-50 active:scale-[0.99]"
                >
                  CRI &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
