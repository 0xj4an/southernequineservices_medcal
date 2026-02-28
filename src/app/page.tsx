import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import CalculatorWrapper from "@/components/CalculatorWrapper";

export const dynamic = "force-dynamic";

export default async function Home() {
  const medications = await prisma.medication.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const criMedications = await prisma.criMedication.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const procedures = await prisma.procedure.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1">
        <CalculatorWrapper
          medications={medications}
          criMedications={criMedications}
          procedures={procedures}
        />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Southern Equine Service. All rights
          reserved.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Made by{" "}
          <a
            href="https://github.com/0xj4an"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c8a45a] hover:underline"
          >
            0xj4an
          </a>
        </p>
      </footer>
    </div>
  );
}
