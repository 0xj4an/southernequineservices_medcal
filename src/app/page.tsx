import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Calculator from "@/components/Calculator";

export const dynamic = "force-dynamic";

export default async function Home() {
  const medications = await prisma.medication.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <Header />

      <main className="flex-1">
        <Calculator medications={medications} />
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Southern Equine Service. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
