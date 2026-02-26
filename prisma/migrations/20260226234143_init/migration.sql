-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "doseMin" REAL NOT NULL,
    "doseMax" REAL NOT NULL,
    "concentration" REAL NOT NULL,
    "concentrationUnit" TEXT NOT NULL DEFAULT 'mg/ml',
    "route" TEXT NOT NULL,
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
