# Architecture Decision Records (ADRs) - SpitExpense

This document compiles the Architecture Decision Records (ADRs) for the SpitExpense Shared Expense Management Application. It documents the core engineering decisions, alternatives considered, justifications, and tradeoffs.

---

## 1. Object-Relational Mapper: Prisma vs. Raw SQL

### Problem
Managing database access, migrations, relations, and transactional operations on financial entities (users, groups, splits, settlements) requires type safety and query readability. Writing raw SQL can lead to SQL injection vulnerabilities and manual maintenance of schemas.

### Options Considered
* **Option A: Raw SQL Queries** (using a native client like `mysql2`).
* **Option B: Query Builders** (like `Knex.js`).
* **Option C: Schema-First ORM** (like `Prisma ORM`).

### Decision Taken
**Option C: Prisma ORM**.

### Reasoning
* **Type Safety**: Prisma generates type-safe schemas based on the database definition, preventing runtime SQL errors.
* **ACID Transactions**: Prisma’s interactive transactions (`prisma.$transaction`) simplify locking multi-row inserts (e.g. creating an expense and distributing splits).
* **Migration Handling**: Declarative migrations match git histories, simplifying schema synchronizations.

### Tradeoffs
* **Performance Overhead**: An ORM adds a small processing wrapper layer compared to raw queries.
* **Feature Access**: Specialized MySQL database functions (e.g., custom spatial indexes or full-text optimizations) require escaping to raw SQL query wrappers in Prisma.

---

## 2. Database Engine: MySQL vs. NoSQL

### Problem
Financial transactions, balance allocations, and settlements require strict consistency and transactional isolation. A ledger imbalance (such as an expense created without its corresponding split records) breaks the entire application.

### Options Considered
* **Option A: Relational Database (MySQL / PostgreSQL)**.
* **Option B: NoSQL Database (MongoDB / DynamoDB)**.

### Decision Taken
**Option A: Relational Database (MySQL)**.

### Reasoning
* **ACID Compliance**: MySQL provides robust row-level transaction safety (Atomicity, Consistency, Isolation, Durability) via the InnoDB storage engine.
* **Foreign Key Constraints**: Relational integrity guarantees that delete operations cascade or restrict properly (e.g., preventing a user from being deleted if they owe splits).
* **Aggregations**: Enables fast SQL aggregations (`SUM`, `COUNT`) on indexed fields for balance calculations.

### Tradeoffs
* **Rigid Schemas**: Schema changes require database migrations and table locks in production.
* **Scalability**: Scaling write capacity horizontally is more complex with MySQL than partition-based NoSQL systems.

---

## 3. Dynamic Membership History: Status Flag vs. Delete

### Problem
In shared groups, memberships change over time. When a member leaves, deleting their membership breaks relational foreign-key references to past transactions. However, keeping them active allows them to be mistakenly added to new group outlays.

### Options Considered
* **Option A: Delete Membership Record** (wipes historical logs or orphans transactions).
* **Option B: Hard association on transactions** (copies user names into static text fields, decoupling database normalization).
* **Option C: Membership Status Enum (`ACTIVE` / `LEFT`) and Date intervals**.

### Decision Taken
**Option C: Membership Status Enum**.

### Reasoning
* **Relational Integrity**: Foreign-key references to leaving members are preserved, keeping previous balance calculations accurate.
* **Safe Expense Entry**: Frontends and validators only load members with `status: ACTIVE` when creating new transactions.
* **Timeline Traceability**: `leftAt` and `joinedAt` timestamps capture the user's active membership intervals.

### Tradeoffs
* **Query Complexity**: Dynamic balance calculations must filter out transactions that occurred outside the user's active membership dates.

---

## 4. Deleting Transactions: Soft Delete vs. Hard Delete

### Problem
Users occasionally make mistakes and delete logged expenses or settlements. A hard delete (`DELETE FROM ...`) removes the row completely, making audit trailing impossible and changing historical ledger balances without a trace.

### Options Considered
* **Option A: Hard Database Delete**.
* **Option B: Soft Delete (`isDeleted` flag)**.

### Decision Taken
**Option B: Soft Delete (`isDeleted` flag)**.

### Reasoning
* **Audit Trails**: Retaining the record prevents data loss and maintains historical audit logs.
* **Traceability**: Keeps database relations intact for reporting and debugging.
* **Data Recovery**: Allows administrators to restore deleted entries by toggling the boolean flag.

### Tradeoffs
* **Filter Pollution**: All query operations (balances, reports, list views) must explicitly add `{ isDeleted: false }` filter conditions.
* **Storage Growth**: Inactive rows remain in table spaces, requiring optimization of index spaces over time.

---

## 5. Anomaly Resolution: Automated Cleanup vs. Approval Workflow

### Problem
When CSV uploads contain errors or anomalies (e.g., potential duplicate expenses or missing currency conversion rates), processing them immediately creates ledger conflicts. Automatically correcting or rejecting them is often too rigid.

### Options Considered
* **Option A: Auto-Discard Anomaly Rows** (rejects entire rows automatically).
* **Option B: Auto-Fixing Heuristics** (makes assumptions to resolve anomalies automatically, e.g. guess exchange rates).
* **Option C: Pending Queue Approval/Rejection Workflow**.

### Decision Taken
**Option C: Pending Queue Approval/Rejection Workflow**.

### Reasoning
* **Human Oversight**: Users can review exceptions (like duplicate coffee purchases) and write explanations.
* **Audit Trail**: Saves who approved the anomaly, when it was resolved, and why (`resolutionNote`).
* **Ledger Safety**: Prevents automated scripts from silently creating incorrect entries.

### Tradeoffs
* **UX Friction**: Requires user manual intervention to review and approve anomalies before the import can complete.

---

## 6. CSV Storage: Store Raw Import Rows vs. Parse-and-Discard

### Problem
When importing large files, parsing the file, resolving users, and writing directly to transactions can fail midway (e.g. database disconnect). Discarding the file makes auditing imports and identifying validation errors difficult.

### Options Considered
* **Option A: Parse-and-Discard** (directly populate expenses/settlements, discard CSV metadata).
* **Option B: Store Raw Import Rows in Database (`ImportRow` model)**.

### Decision Taken
**Option B: Store Raw Import Rows in Database**.

### Reasoning
* **Asynchronous Safety**: Uploads are stored as raw strings immediately. Processing and anomaly scanning can run asynchronously without re-reading files.
* **Audit Trail**: Retaining `ImportRow` links created transactions back to the source row and the raw data.
* **Traceability**: Allows generating error reports pointing to the exact row number in the CSV.

### Tradeoffs
* **Database Size**: Storing raw stringified JSON in `rawContent` columns increases table sizes.

---

## 7. Multi-Currency: Normalized Amount vs. On-The-Fly Conversions

### Problem
Members inside a group can incur expenses in multiple currencies (USD, EUR, INR). To compute a unified group balance sheet, we must consolidate amounts, but exchange rates fluctuate daily.

### Options Considered
* **Option A: On-the-fly Currency Conversions** (perform conversions when querying balances).
* **Option B: Normalized Database Amount (base currency `INR`)**.

### Decision Taken
**Option B: Normalized Database Amount (base currency `INR`)**.

### Reasoning
* **Performance**: Consolidating balances requires a simple `SUM` aggregation on indexed `normalizedAmount` fields instead of executing currency lookups on every fetch.
* **Historical Accuracy**: Converted values are locked using exchange rates effective on the transaction date, preventing balance shifts when rates change.
* **Audit Traceability**: Both `originalAmount`/`originalCurrency` and `normalizedAmount`/`exchangeRate` are saved on the transaction.

### Tradeoffs
* **Write Overhead**: Requires querying and validating exchange rates on every write operation.

---

## 8. Financial Modeling: Separate Expense & Settlement Tables

### Problem
Expenses (outlays split among multiple debtors) and Settlements (repayments from one member to another) are mathematically different. Representing them in a single `Transaction` table requires null fields and complex query logic.

### Options Considered
* **Option A: Single Unified Transaction Table** (uses flags and polymorphic fields).
* **Option B: Separate `Expense` and `Settlement` tables**.

### Decision Taken
**Option B: Separate `Expense` and `Settlement` tables**.

### Reasoning
* **Data Integrity**: Expenses require one-to-many `ExpenseSplit` relations. Settlements are strictly one-to-one (payer to payee). Separation prevents database schema anomalies (e.g., split records linked to a settlement).
* **Query Readability**: Simplifies queries for calculations, reports, and audit logs.

### Tradeoffs
* **Aggregation Complexity**: Calculating balances requires querying both tables in parallel and aggregating the results.

---

## 9. Debt Settler: Min-Cash-Flow vs. Bilateral Settlements

### Problem
Without optimization, settling debts requires numerous bilateral transactions (e.g., A pays B, B pays C, C pays A). We need an algorithm to simplify repayments.

### Options Considered
* **Option A: Bilateral Settlements** (each debtor pays their exact lenders directly).
* **Option B: Greedy Min-Cash-Flow Algorithm**.

### Decision Taken
**Option B: Greedy Min-Cash-Flow Algorithm**.

### Reasoning
* **Transaction Minimization**: Reduces the number of repayments. For a group of $N$ users, the algorithm resolves all debts in at most $N-1$ transactions.
* **Ease of Use**: Users avoid making multiple micro-transactions, settling their balance in one or two transfers instead.

### Tradeoffs
* **Mathematical Disconnect**: The generated plan might instruct A to pay C even if A’s original debt was to B. While mathematically correct, this can confuse users.
* *Mitigation*: We show detailed audit trails explaining the balance breakdown.

---

## 10. Access Tokens: JWT Authentication vs. Server Sessions

### Problem
The API must authenticate requests and verify permissions. Using server-side sessions requires session storage and database lookups on every incoming request.

### Options Considered
* **Option A: Server-Side Session State** (stored in MySQL or Redis).
* **Option B: Stateless JWT Authentication**.

### Decision Taken
**Option B: Stateless JWT Authentication**.

### Reasoning
* **Stateless Scaling**: The API server does not need to store session states, enabling horizontal scaling.
* **Mobile-Friendly**: JWTs work natively across client platforms (React Web, mobile apps).

### Tradeoffs
* **Token Invalidation**: JWTs cannot be easily revoked before expiration without maintaining a blacklist database.
* *Mitigation*: Keep token lifespans short and use standard expirations.

---

## 11. Transaction Auditing: Comprehensive Audit Trails vs. Log Files

### Problem
Financial operations (like CSV processing and anomaly approvals) must be fully traceable. If a ledger discrepancy occurs, log files are difficult to query and reconcile.

### Options Considered
* **Option A: File-Based Logs** (write events to log files).
* **Option B: Database-Backed Audit Trails** (linking anomalies, resolutions, and generated entities).

### Decision Taken
**Option B: Database-Backed Audit Trails**.

### Reasoning
* **Referential Integrity**: Resolutions and generated expenses are linked directly to `ImportRow` and `Anomaly` tables.
* **Interactive UI**: Allows the application to render audit logs and reports directly in the user interface.

### Tradeoffs
* **Storage Footprint**: Table growth is higher, requiring archiving strategies over time.

---

## 12. File Auditing: Import Source Tracking

### Problem
When expenses are generated from CSV files, developers must be able to trace them back to their source import to troubleshoot parser or validation errors.

### Options Considered
* **Option A: No Source Tracking** (expenses are written without any link to the import).
* **Option B: Link to Import Job (`importId` on Expense/Settlement)**.
* **Option C: Link to both Import Job and Import Row (`importId` and `importRowId` on Expense/Settlement)**.

### Decision Taken
**Option C: Link to both Import Job and Import Row**.

### Reasoning
* **Granular Traceability**: Allows tracing the generated expense back to the exact row number and raw CSV text.
* **Duplicate Prevention**: Enables checking if a specific row has already generated an expense, preventing duplicate database writes.

### Tradeoffs
* **Schema Schema Changes**: Requires storing additional foreign keys on both `Expense` and `Settlement` models.
