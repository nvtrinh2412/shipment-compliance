# Safiri AI Shipment Compliance

A modern full-stack platform for validating logistics shipment data and ensuring compliance through an extensible rules engine.

## 🚀 Tech Stack
- **Backend**: NestJS, PostgreSQL, Prisma, Zod, Jest
- **Frontend**: React (Vite), TypeScript, TailwindCSS v4, TanStack React Query
- **Infrastructure**: Docker (PostgreSQL)

---

## 🛠️ Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)
- **Docker & Docker Compose** (for running the PostgreSQL database locally)

---

## 🏁 Getting Started

Follow these steps to run the full stack locally.

### 1. Start the Database
The platform relies on a PostgreSQL database. From the root directory of the project, start the database using Docker:
```bash
docker-compose up -d
```
*(This starts a Postgres instance on port 5432 with the credentials defined in the `docker-compose.yml`)*

### 2. Setup and Run the Backend
Open a new terminal, navigate to the `backend` directory, and initialize the database:
```bash
cd backend
npm install

# Generate Prisma Client and push the schema to the database
npx prisma generate
npx prisma db push

# Seed the database with required ISO reference data (Countries, Currencies)
npx prisma db seed

# Start the NestJS development server
npm run start:dev
```
✅ **Backend API**: Running at [http://localhost:3000](http://localhost:3000)
✅ **Swagger API Docs**: Available at [http://localhost:3000/api](http://localhost:3000/api)

### 3. Setup and Run the Frontend
Open another terminal, navigate to the `frontend` directory, and start the React dashboard:
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
✅ **Frontend Dashboard**: Running at [http://localhost:5173](http://localhost:5173)

---

## 🌟 Key Features
- **OCR Ingestion Engine**: Accepts raw, semi-structured JSON payloads and maps them to strictly-typed domain models.
- **Extensible Validation Engine**: Executes 10 discrete compliance rules in parallel, checking for anomalies like:
  - Missing required fields (Exporter, Importer, Bill of Lading)
  - Invalid HS Code formats
  - Uncertified Wood Packaging (ISPM-15 checks)
  - Suspicious invoice valuations
  - Stale arrival dates and weight mismatches
- **Compliance Dashboard**: A premium, glassmorphism-styled UI to monitor shipment readiness and review critical action items before customs submission.
