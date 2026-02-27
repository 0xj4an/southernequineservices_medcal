"use client";

import { useState } from "react";
import Calculator from "./Calculator";
import CriCalculator from "./CriCalculator";
import type { Medication, CriMedication } from "@/types";

interface Props {
  medications: Medication[];
  criMedications: CriMedication[];
}

export default function CalculatorWrapper({ medications, criMedications }: Props) {
  const [activeTab, setActiveTab] = useState<"bolus" | "cri">("bolus");

  return (
    <div>
      {/* Tab Bar */}
      <div className="bg-[#1a2332]/95 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("bolus")}
              className={`px-4 py-3 text-sm font-semibold transition-colors sm:text-base ${
                activeTab === "bolus"
                  ? "text-[#c8a45a] border-b-2 border-[#c8a45a]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Bolus
            </button>
            <button
              onClick={() => setActiveTab("cri")}
              className={`px-4 py-3 text-sm font-semibold transition-colors sm:text-base ${
                activeTab === "cri"
                  ? "text-[#c8a45a] border-b-2 border-[#c8a45a]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              CRI
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Content */}
      {activeTab === "bolus" ? (
        <Calculator medications={medications} />
      ) : (
        <CriCalculator criMedications={criMedications} />
      )}
    </div>
  );
}
