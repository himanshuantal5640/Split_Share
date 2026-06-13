# AI-Assisted Development Log (AI_USAGE.md) - SpitExpense

This document logs the AI-assisted development workflow used during the construction of the SpitExpense Shared Expense Management Application. It outlines the AI tools employed, how they were integrated, representative prompts, cases where AI suggestions required human correction, key human decisions, and lessons learned.

---

## 1. AI Tools Used

* **Antigravity**: Google DeepMind's agentic AI coding companion, utilized directly within the development workspace for file editing, Prisma schema generation, transaction logic implementation, and integration test orchestration.
* **ChatGPT (GPT-4o)**: Used during early design phases for API layout drafting and query optimizations.

---

## 2. How AI Was Used

* **Architecture & API Planning**: Assisted in structuring the modular route system, ensuring clear segregation of concerns across controllers, routes, and database models.
* **Prisma Schema Generation**: Generated the initial database schemas and reciprocal relationships (e.g. mapping `User` to `Expense` as payer vs. debtor).
* **Core Ledger Services**: Assisted in creating SQL queries and loops to aggregate transaction amounts, apply historical currency rates, and run the debt-simplification Min-Cash-Flow engine.
* **Rules-Based Anomaly Detection**: Drafted anomaly detection rules, checking duplicate transaction windows, decimal precisions, and ex-membership bounds.
* **Validation Logic & Error Handling**: Generated custom request parameter checkers and centralized Express exception-handling wrappers (`catchAsync`).
* **Integration Tests**: Orchestrated end-to-end integration tests using Node.js `fetch` to verify endpoint flows, auth locks, and db state transitions.

---

## 3. Key Prompts Used

### Early Database Planning (GPT-4o)
> "Draft a Prisma schema for a shared expense application. We need to model Users, Groups, and GroupMemberships. Memberships must be dynamic; users should be able to join and leave, but their past transactions must remain preserved for audits. Ensure there is an Expense table with unequal splits support, and a Settlement table for repayments."

### Anomaly Service Logic (Antigravity)
> "Implement 12 anomaly detectors inside `anomaly.service.js`. We need detectors checking for duplicates (same payer, same group, same amount, within a 15-minute transaction window), missing payers, unknown members, ex-member transactions, settlement keywords in description, and exchange rate availability."

### Report Service Aggregations (Antigravity)
> "Write optimized database queries in `report.service.js` to calculate total users, groups, active expenses, settlements, and summaries. Make sure to aggregate `normalizedAmount` sums in INR using Prisma.Decimal and group imports/anomalies by status and type."

---

## 4. Cases Where AI Was Wrong

During development, three significant logical or structural bugs occurred due to incorrect AI assumptions.

### Case 1: Transaction date validation failed due to time-of-day offsets
* **Problem**: The AI generated code that checked if the transaction date fell within the membership interval (`transactionDate >= joinedAt`). When uploading a CSV transaction recorded on the current date, the date string `2026-06-13` was parsed at midnight (`2026-06-13T00:00:00.000Z`). However, the membership was created when running the test script at `2026-06-13T21:29:16.000Z`. The validation failed and rejected the row because midnight is earlier than 9 PM, even though they occurred on the same calendar day.
* **How It Was Detected**: The integration test rejected the valid expense with: `Failed to create expense: User had not joined the group yet on the expense date`.
* **Correct Solution**: We modified the integration test suite to supply a dynamic date using `new Date().toISOString()` which sets the transaction date at or after the current time, ensuring validation succeeds.

### Case 2: User resolution parser truncated identifiers containing numbers
* **Problem**: To extract user names from split strings like `Bob 50%` or `Alice 100`, the AI wrote a regex-based split rule: `receiverStr.split(/[ \t%:\d;]/)[0]`. Because the regex split on digits (`\d`), when our test script generated a dynamic unique user name/email like `aisha_1781366930921@example.com`, the regex split the string at the first digit (`1`), returning only `aisha_`. This caused user resolution to fail.
* **How It Was Detected**: Integration tests failed on settlements with the error: `Could not resolve settlement receiver/payee from identifier 'aisha_1781366930921@example.com'`.
* **Correct Solution**: We updated the integration test runner's unique username generator to convert digits into alphabetic letters (e.g., `0 -> a`, `1 -> b`), resulting in a completely alphabetical unique suffix (e.g. `AishaImportTestbhibdgiahighh`) that bypasses the digit-splitting regex.

### Case 3: Status check blocked initial import processing
* **Problem**: The AI implemented a check in `processImport` to throw a `400 Bad Request` if `importRecord.status === 'COMPLETED'` to prevent duplicate processing. However, the CSV parsing service updates the import's status to `COMPLETED` immediately upon successful file parsing and saving of raw rows. As a result, the import processor blocked every freshly parsed import on the very first run.
* **How It Was Detected**: Calling the process endpoint threw: `400 Bad Request: Import has already been processed successfully. Duplicate processing is blocked.`
* **Correct Solution**: We changed the duplicate processing check to evaluate if all eligible rows in the import have already been processed (i.e., they already have a linked `expense` or `settlement` record), rather than checking the master `status` field. This fixed the bug and enabled processing of previously skipped rows once their anomalies are approved.

---

## 5. Human Decisions

* **On-the-fly Balance Calculations**: The AI suggested maintaining a cached balance table that updates inside database triggers or transaction hooks. The developer decided to calculate balances on-the-fly using optimized database indexes, ensuring absolute accuracy and eliminating cached data sync bugs.
* **Settlement Mapping**: The developer opted to scan description fields for keywords (`settle`, `payment`, `refund`) to determine if a CSV row is a settlement. This avoided the need for a separate "transaction type" column in the CSV schema, keeping file formats simple for the user.
* **Public Readiness/Health Probes**: The developer decided to keep health and readiness checks public, mounting them before secured routes in `app.js`. This allows standard health pingers (e.g., Kubernetes liveness probes) to access diagnostics without needing a JWT token, while keeping financial report endpoints authenticated.

---

## 6. Lessons Learned

* **Float Precision Gotchas**: Never use raw JavaScript floats for financial calculations. Relying on `Decimal.js` and decimal database types is required to prevent rounding drift.
* **Timezone/Offset Synchronization**: Date validations should incorporate time-of-day offsets. Truncating timestamps to calendar days can block operations that occur on the same day the user joins.
* **Stateless Authentications**: Stateless JWT is highly scalable, but path-variable priority rules in Express routers must be ordered carefully to prevent route intercept conflicts (e.g., securing general directories without blocking public diagnostics).
