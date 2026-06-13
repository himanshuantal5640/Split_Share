# SpitExpense Backend: Architecture Decision Records (ADRs)

This document tracks the architectural decisions made during the design of the SpitExpense backend service.

---

## ADR-001: Database Engine and Object-Relational Mapper (ORM)

### Status
Accepted

### Context
SpitExpense requires solid relational integrity. Entities such as users, groups, memberships, expenses, splits, and settlements are tightly linked. Furthermore, splitting expenses and settling debts requires absolute transaction safety (ACID properties) to ensure that partial state writes (e.g., creating an expense but failing to create its splits) never occur. We need an database engine and an ORM/query builder that support strong transactions, type safety, and fast relational joins.

### Decision
* **Database**: MySQL (version 8.0+)
* **ORM**: Prisma Client

### Consequences
* **Pros**:
  * MySQL provides robust, production-grade ACID compliance, foreign key constraints, and performance.
  * Prisma offers excellent type-safety through schema-first generation, reducing manual query errors.
  * Interactive transactions (`prisma.$transaction`) make managing multi-table modifications simple and safe.
  * Prisma's migrations are declarative and automatically handled, easing database evolution.
* **Cons**:
  * Prisma does not natively support some database-specific features without raw queries, though none of our features require specialized MySQL features.
  * Database schema migrations require structured development sync, unlike schema-less NoSQL solutions.

---

## ADR-002: Precision Math and Currency Handling

### Status
Accepted

### Context
JavaScript uses IEEE 754 double-precision floats for all numbers. This introduces rounding errors in basic operations (e.g., `0.1 + 0.2 === 0.30000000000000004`), which is unacceptable for a financial application like SpitExpense. We must decide how to store and compute currency values.
Common approaches:
1. **Integer Representation**: Store values as cents/integers in the database (e.g. $10.00 is stored as `1000`) and divide by 100 on display.
2. **Decimal Representation**: Store values as SQL `DECIMAL(10,2)` in the database, and use a dedicated decimal library (e.g. `decimal.js`) in JavaScript.

### Decision
Store all financial values as `DECIMAL(10,2)` in MySQL and use `decimal.js` for all backend calculations.

### Consequences
* **Pros**:
  * Decimal representations are human-readable when querying the database directly (no need to translate cents to dollars in MySQL Workbench/Adminer).
  * `DECIMAL(10,2)` restricts values to two decimal points directly at the database level, preventing garbage numbers from being written.
  * `decimal.js` provides comprehensive rounding methods (e.g., round-half-up) and prevents precision leakage during complex divisions (such as splitting an odd amount by 3).
  * Fits neatly with Prisma's native `Decimal` type mapped to JavaScript's `Decimal` type.
* **Cons**:
  * `decimal.js` objects require explicit method calls (e.g., `.add()`, `.mul()`) instead of standard arithmetic operators (`+`, `*`).
  * Slightly higher memory footprint than native integers, though negligible at SpitExpense scale.

---

## ADR-003: Asynchronous CSV Processing

### Status
Accepted

### Context
Users can upload CSV files containing hundreds or thousands of expense records. Processing these imports synchronously inside a single HTTP request poses serious risks:
1. HTTP request timeouts.
2. High memory spikes leading to Node.js Event Loop starvation.
3. Poor user experience (blocking UI waiting for a response).

### Decision
Implement a worker-queue pattern using a background job worker (such as `BullMQ` backed by Redis, or an in-memory queue like `better-queue` for lower resource environments) to process CSV imports asynchronously.

### Consequences
* **Pros**:
  * Instant API feedback (returns HTTP `202 Accepted` with a `jobId`), freeing up the API server threads.
  * Fault-tolerant: if the backend server restarts, unfinished jobs in the queue can be retried.
  * The file is parsed as a stream (using `fast-csv`), preventing heap-exhaustion issues.
  * Clear progress tracking for the frontend through status polling.
* **Cons**:
  * Introduces extra infrastructure dependencies (Redis for BullMQ) or in-memory complexity (for local queuing).
  * Frontend must implement state polling or WebSockets to display progress.

---

## ADR-004: Dynamic Membership & History Preservation

### Status
Accepted

### Context
In shared expense groups, membership is dynamic: users join, leave, or change roles. However, when a user leaves a group, their past financial interactions (expenses they paid, splits they participated in, settlements they made) must be preserved for balance calculation and auditing. Deleting membership rows breaks foreign key constraints, while leaving their membership untouched allows them to be added to new expenses incorrectly.

### Decision
Implement logical membership tracking using a `status` enum (`ACTIVE` or `LEFT`) on the `GroupMembership` relation. When a user leaves a group, their membership status is changed to `LEFT` and the `leftAt` timestamp is set.

### Consequences
* **Pros**:
  * Keeps database referential integrity intact: all past expenses and splits remain fully linked to the `users` and `groups` tables.
  * Easy query isolation: we filter active group members by querying `status: 'ACTIVE'` when rendering lists for new expenses.
  * Auditability: provides a complete timeline of when users were active in a group.
* **Cons**:
  * Query logic must explicitly check `status: 'ACTIVE'` to prevent adding former members to new transactions.
  * If a user rejoins a group, we must update the existing record back to `ACTIVE` instead of inserting a duplicate row.

---

## ADR-005: Real-time Dynamic Balance Calculation

### Status
Accepted

### Context
To show users how much they owe or are owed in a group, we must aggregate all group expenses, splits, and settlements. There are two primary approaches:
1. **Materialized Balances**: Maintain a `GroupMemberBalance` table. On every expense or settlement created, updated, or deleted, modify this table in the same transaction.
2. **On-the-fly Calculation**: Query the database and dynamically sum up paid expenses, splits, and settlements for each user in the group whenever requested.

### Decision
Implement optimized on-the-fly dynamic calculation using SQL aggregations, backed by indexes on `groupId`, `paidById`, `userId`, `payerId`, and `payeeId`.

### Consequences
* **Pros**:
  * Guarantee of absolute correctness: there is no risk of the cached/materialized balance drifting from actual transaction records (a common source of bugs in ledger systems).
  * Simple database logic: no need to write complex database triggers or manage dual-write locks on every expense edit.
* **Cons**:
  * Calculating on-the-fly requires scanning transactions. For massive groups with tens of thousands of expenses, this query latency could degrade.
  * *Mitigation*: We will build indexes on foreign keys. If scale issues arise, we can introduce a caching layer (e.g. Redis hashes) that is invalidated whenever an expense write occurs, or introduce background materialized tables as a caching optimization, without changing the core balance engine API.
