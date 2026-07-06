-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "exporter" TEXT NOT NULL,
    "importer" TEXT NOT NULL,
    "commercialInvoiceNumber" TEXT NOT NULL,
    "invoiceValue" REAL NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "goodsDescription" TEXT NOT NULL,
    "hsCode" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "grossWeightKg" REAL NOT NULL,
    "netWeightKg" REAL NOT NULL,
    "numberOfPackages" INTEGER NOT NULL,
    "containerNumber" TEXT NOT NULL,
    "billOfLadingNumber" TEXT NOT NULL,
    "packagingType" TEXT NOT NULL,
    "ispm15Certified" BOOLEAN,
    "arrivalDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shipment_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "IsoCurrency" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Shipment_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "IsoCountry" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValidationIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "fieldInvolved" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ValidationIssue_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    CONSTRAINT "AuditLog_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IsoCountry" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "IsoCurrency" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_reference_key" ON "Shipment"("reference");
