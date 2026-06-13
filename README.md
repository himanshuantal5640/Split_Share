# SpitExpense - Shared Expense Management Application

SpitExpense is a premium, full-stack shared expense management application built for the **Spreetail Software Developer Assignment**. It provides a robust solution for tracking group expenses, managing dynamic memberships, importing batch logs, detecting transaction anomalies, normalizing multiple currencies, and calculating optimal settlement plans using advanced debt-simplification algorithms.

---

## 1. Project Overview

SpitExpense is designed to solve the real-world friction of shared financial tracking. Unlike simple expense splitters, SpitExpense supports:
* **Dynamic Memberships**: Retains structural history of members who leave or join groups, ensuring previous accounting remains audit-correct.
* **Stream-Based CSV Importer**: Processes thousands of transactions asynchronously without memory leaks.
* **Rules-Based Anomaly Engine**: Scans incoming records for currency mismatches, duplicate entries, suspicious split ratios, and unregistered payers.
* **Multi-Currency Normalization**: Normalizes all expenses and settlements to **INR** using effective exchange rates relative to transaction dates.
* **Greedy Min-Cash-Flow Settler**: Simplifies multi-party debts down to the minimal number of direct transactions.
* **Health & Readiness Checking**: Integrated readiness and diagnostics probes designed for modern containerized cloud deployments.

---

## 2. Tech Stack

### Frontend
* **Core**: React 18, HTML5, JavaScript (ES6+)
* **Styling**: Tailwind CSS (sleek, cohesive dark modes and HSL palettes)
* **Routing**: React Router DOM
* **HTTP Client**: Axios

### Backend
* **Runtime**: Node.js
* **Framework**: Express.js
* **ORM**: Prisma Client (v6)
* **Database**: MySQL (relational database supporting ACID transactions)
* **CSV Parsing**: Stream-based `csv-parser` / `fast-csv`

---

## 3. Architecture Overview

```
                      ┌──────────────────────┐
                      │    React Frontend    │
                      └──────────┬───────────┘
                                 │ HTTP / JSON
                                 ▼
                     ┌────────────────────────┐
                     │   Express Router/API   │
                     └──────────┬─────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
       ┌───────────────────────┐   ┌───────────────────────┐
       │   Services Layer      │   │   System Diagnostics  │
       ├───────────────────────┤   ├───────────────────────┤
       │ 1. Auth Service       │   │ * Readiness Probe     │
       │ 2. Expense/Split      │   │ * Health Metrics      │
       │ 3. Settlement Service │   └───────────────────────┘
       │ 4. Anomaly Service    │
       │ 5. Currency Engine    │
       │ 6. Balance Engine     │
       │ 7. Debt Settlement    │
       │ 8. Import Processor   │
       │ 9. Reporting Service  │
       └───────────┬───────────┘
                   │ Prisma ORM
                   ▼
       ┌───────────────────────┐
       │   MySQL Database      │
       └───────────────────────┘
```

The backend follows a strict **Controller-Service-Data** design pattern:
1. **Routing Layer**: Exposes Express Router end-points guarded by JWT verification middleware.
2. **Controller Layer**: Parses path variables, validates input payload formats (using custom lightweight validators), and delegates to the Service Layer.
3. **Service Layer**: Houses the isolated business logic, currency normalization formulas, and math engines.
4. **Data Access Layer**: Interacts with MySQL using Prisma ORM. Complex operations (like adding expenses with splits) run inside database transactions to ensure atomic integrity.

---

## 4. Database Design Summary

The MySQL database schema is structured to ensure ACID properties on complex expense transactions. Financial figures are calculated and stored using the `Decimal` type to avoid floating-point rounding errors.

### Schema Relationships
* **User**: Can create multiple groups, belong to multiple groups, pay expenses, participate in splits, and initiate CSV imports.
* **Group**: Organizes memberships, active expenses, settlements, and imports.
* **GroupMembership**: Supports statuses `ACTIVE` and `LEFT`. If a member leaves, they are flagged as `LEFT` with a `leftAt` timestamp. This preserves foreign-key links and histories for previous transaction balance calculations.
* **Expense & ExpenseSplit**: Holds the details of expenses and splits. If a transaction is recorded in another currency (e.g. `USD`), it stores original details and maps to `normalizedAmount` in `INR`.
* **Settlement**: Tracks debt clearings recorded between group members.
* **Import & ImportRow**: Tracks asynchronous CSV batch uploads. `ImportRow` stores the raw stringified row to preserve historical uploads.
* **Anomaly**: Flags inconsistencies in raw CSV rows (e.g. `DUPLICATE_EXPENSE`, `MISSING_EXCHANGE_RATE`, `MEMBERSHIP_CONFLICT`).
* **ExchangeRate**: Contains historical rates mapping currencies to the base normalization currency (`INR`) relative to their effective date.

---

## 5. Folder Structure

```
Spit_expense/
├── Frontend/                  # React Frontend Application
│   ├── public/                # Static assets
│   ├── src/                   # React components, routing, services
│   │   ├── components/        # Sleek UI widgets and dashboards
│   │   ├── context/           # React Context (Auth, states)
│   │   ├── services/          # API call handlers
│   │   └── App.jsx            # Application entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Express Backend Application
│   ├── prisma/
│   │   └── schema.prisma      # Prisma database schema definition
│   ├── src/
│   │   ├── config/            # Prisma, JWT & Env configurations
│   │   ├── controllers/       # HTTP controllers (Request validation)
│   │   ├── middleware/        # Error handlers and JWT middleware
│   │   ├── routes/            # Express route routes
│   │   ├── services/          # Core Business Logic & Math engines
│   │   │   ├── balance.service.js      # Aggregates member balances
│   │   │   ├── debt.service.js         # Greedy debt simplification settler
│   │   │   ├── anomaly.service.js      # Anomaly Rules Engine
│   │   │   ├── importProcessor.service.js # Import Generation pipeline
│   │   │   └── system.service.js       # Readiness & Diagnostic check services
│   │   ├── utils/             # Loggers, error classes, math libraries
│   │   ├── validators/        # Schema and validation utilities
│   │   └── app.js             # Express app mount points
│   ├── server.js              # Server bootstrapper & listener
│   ├── package.json
│   └── .env
```

---

## 6. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development

# MySQL Database connection string (adjust credentials accordingly)
DATABASE_URL="mysql://root:password@localhost:3306/spit_expense"

# JSON Web Token parameters
JWT_SECRET="spreetail_shared_expense_secret_key"
JWT_EXPIRES_IN="7d"
```

---

## 7. Installation & Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MySQL** database (running on port 3306)

### Step 1: Clone and Configure
Clone the repository, create your MySQL database, and set up the `.env` file inside `backend/` as shown above.

### Step 2: Backend Setup
Open a terminal in the `backend/` folder and execute:
```bash
# Install dependencies
npm install

# Push the schema changes directly to the MySQL database
npx prisma db push

# Generate the Prisma Client
npx prisma generate
```

### Step 3: Frontend Setup
Open another terminal in the `Frontend/` folder and execute:
```bash
# Install dependencies
npm install
```

---

## 8. Running Locally

To run the application locally, start both the backend and frontend dev servers.

### Start Backend
In the `backend/` terminal:
```bash
npm run dev
```
The server will run on `http://localhost:5000`. You should see `Database connected successfully` in the logs.

### Start Frontend
In the `Frontend/` terminal:
```bash
npm run dev
```
The React development server will start (usually on `http://localhost:5173`).

---

## 9. API Overview

All routes requiring authentication must include the HTTP header: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication
* `POST /api/auth/register` - Create user profile.
* `POST /api/auth/login` - Authenticate user and fetch token.

### Group Management
* `POST /api/groups` - Create a group.
* `POST /api/groups/:groupId/members` - Add an active member.
* `DELETE /api/groups/:groupId/members/:userId` - De-activate a member (sets status to `LEFT`).

### Expense & Settlements
* `POST /api/expenses` - Create expense (supports EQUAL, UNEQUAL, PERCENTAGE).
* `POST /api/settlements` - Record a settlement.

### CSV Imports & Processing
* `POST /api/imports/upload` - Upload raw CSV.
* `POST /api/imports/:importId/analyze` - Runs rules anomalies analysis.
* `POST /api/imports/:importId/process` - Processes approved/anomalies-free rows.

### Balances & Debt Simplification
* `GET /api/balances/group/:groupId` - Computes live group net positions.
* `GET /api/balances/simplified/:groupId` - Computes min cash flows.
* `GET /api/groups/:groupId/settlement-plan` - Outputs optimal repayment recommendations.

### Diagnostics & Readiness
* `GET /api/system/readiness` - Public readiness verification probe (MySQL check, env check, write directory check).
* `GET /api/system/health` - Public sub-component health latency monitoring check.

---

## 10. Deployment Instructions

1. **MySQL Database**: Provision a hosted database instance (e.g. AWS RDS MySQL or GCP Cloud SQL).
2. **Environment Variables**: Configure all secrets (like `DATABASE_URL` and `JWT_SECRET`) securely in your environment parameters.
3. **Prisma Schema Build**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. **Backend App**: Compile and run the backend server on any Node-supported container/VM (e.g. AWS ECS Fargate, Heroku, Render).
5. **Frontend App**: Build the static React application using `npm run build` inside the `Frontend` folder and deploy to a CDN (e.g. Netlify, Vercel, S3). Ensure the backend endpoint URL in the frontend client points to your production server URL.

---

## 11. AI Tools Used

This project was built and debugged in pair programming collaboration with **Antigravity**, Google DeepMind's agentic AI coding companion. Antigravity assisted in:
* Generating relational database schemas with Prisma ORM.
* Structuring interactive MySQL transactions to guarantee financial transaction ACID properties.
* Designing and implementing rule engines for anomaly detection.
* Writing edge-case verification checks for dynamic group membership histories.
* Orchestrating integration test scripts to verify API edge behaviors.

---

## 12. Future Improvements

* **Caching Layer**: Integrate Redis to cache group balance calculations for large transaction sheets.
* **Notification Engine**: Implement WebSocket-based real-time push alerts when new settlements are generated or anomalies are raised.
* **Export Utilities**: Generate PDFs and Excel sheets for the Import Processing Reports and Audit Trails directly from the API.
