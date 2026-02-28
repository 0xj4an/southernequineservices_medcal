"use client";

import { useState } from "react";
import Calculator from "./Calculator";
import CriCalculator from "./CriCalculator";
import type { Medication, CriMedication, ProtocolItem } from "@/types";

interface Props {
  medications: Medication[];
  criMedications: CriMedication[];
}

const STEPS = [
  {
    key: "bolus",
    label: "Bolus",
    number: 1,
    hint: "Select a medication, adjust the dose, then tap '+ Add to Protocol'.",
  },
  {
    key: "cri",
    label: "CRI",
    number: 2,
    hint: "Configure constant rate infusions. Add each to your protocol.",
  },
  {
    key: "summary",
    label: "Summary",
    number: 3,
    hint: "Review all medications before administering.",
  },
] as const;

type Step = (typeof STEPS)[number]["key"];

export default function CalculatorWrapper({ medications, criMedications }: Props) {
  const [step, setStep] = useState<Step>("bolus");
  const [protocol, setProtocol] = useState<ProtocolItem[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const currentIndex = STEPS.findIndex((s) => s.key === step);
  const currentStep = STEPS[currentIndex];

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

  const bolusItems = protocol.filter((p) => p.type === "bolus");
  const criItems = protocol.filter((p) => p.type === "cri");

  return (
    <div>
      {/* Step Indicator */}
      <div className="bg-[#1a2332]/95 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 sm:gap-3">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && (
                  <div
                    className={`h-px w-6 sm:w-10 ${
                      currentIndex >= i ? "bg-[#c8a45a]" : "bg-white/20"
                    }`}
                  />
                )}
                <button
                  onClick={() => setStep(s.key)}
                  className="flex items-center gap-1.5 sm:gap-2 group"
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
                    className={`text-sm font-semibold transition-colors sm:text-base ${
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

      {/* Calculator Content */}
      {step === "bolus" && (
        <>
          <Calculator medications={medications} onAddToProtocol={addToProtocol} />
          <div className="mx-auto max-w-6xl px-3 pb-6 sm:px-6 lg:px-8">
            <button
              onClick={() => setStep("cri")}
              className="w-full rounded-xl border-2 border-[#1a2332] bg-[#1a2332] px-6 py-4 text-base font-bold text-white transition-all hover:bg-[#1a2332]/90 active:scale-[0.99] sm:text-lg"
            >
              Continue to CRI &rarr;
            </button>
            {criMedications.length === 0 && protocol.length > 0 && (
              <button
                onClick={() => setStep("summary")}
                className="mt-3 w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-bold text-[#1a2332] transition-all hover:bg-gray-50 active:scale-[0.99]"
              >
                Skip to Summary ({protocol.length})
              </button>
            )}
          </div>
        </>
      )}

      {step === "cri" && (
        <>
          <CriCalculator criMedications={criMedications} onAddToProtocol={addToProtocol} />
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

      {step === "summary" && (
        <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
          {protocol.length === 0 ? (
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
            </div>
          )}

          {/* Navigation */}
          {protocol.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
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
          )}
        </div>
      )}
    </div>
  );
}
