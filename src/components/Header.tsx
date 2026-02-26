import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#1a2332] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Southern Equine Service
            </h1>
            <p className="mt-1 text-sm font-medium text-[#c8a45a] sm:text-base">
              Medication Dosing Calculator
            </p>
          </div>
          <Link
            href="/admin/login"
            className="text-xs text-white/50 transition-colors hover:text-white/80"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
