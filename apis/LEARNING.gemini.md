# Catchery API Analysis & Learning Log

## Project Overview
**Catchery API** is a backend service built with **Go** (Golang) adhering to **Clean Architecture** principles. It serves as the core logic provider for the Catchery application.

## Technology Stack
- **Language:** Go 1.23.1
- **Web Framework:** [Fiber v2](https://gofiber.io/)
- **Database ORM:** [GORM](https://gorm.io/) (PostgreSQL)
- **Configuration:** [Viper](https://github.com/spf13/viper)
- **Logging:** [Logrus](https://github.com/sirupsen/logrus)
- **Validation:** [go-playground/validator](https://github.com/go-playground/validator)
- **Hot Reload:** [Air](https://github.com/cosmtrek/air)

## Architecture: Clean Architecture
The project strictly follows separation of concerns:

1.  **`cmd/`**: Entry points.
    *   `web/main.go`: Starts the Fiber HTTP server.
2.  **`internal/`**: Application code.
    *   **`config/`**: Infrastructure setup (`app.go` wires everything).
    *   **`delivery/http/`**: Controllers (Handlers) and Routes.
    *   **`entity/`**: GORM models mapping to SQL tables.
    *   **`model/`**: DTOs for Requests/Responses.
    *   **`repository/`**: Data access layer.
    *   **`usecase/`**: Business logic layer.
3.  **`db/migrations/`**: SQL migration files.

## Database Schema

### Core Entities

**1. Bagang (Production Unit)**
*   **Table:** `bagang`
*   **Columns:** `id` (UUID), `name`, `isactive`, `created_at`, `updated_at`, `worker_id` (FK), `owner_id` (FK).
*   **Relationships:**
    *   Belongs to a **Worker** (Operator).
    *   Belongs to an **Owner** (also a Worker record).
    *   Has many **Harvests**.

**2. Workers**
*   **Table:** `workers`
*   **Columns:** `id` (UUID), `name`.
*   **Relationships:** Can be a Worker or Owner for a Bagang.

**3. Seasons**
*   **Table:** `seasons`
*   **Columns:** `id` (Serial), `start_date`, `end_date`.
*   **Relationships:** Has many **Harvests**.

### Harvest Domain

**4. Harvests (Hasil Panen)**
*   **Table:** `harvests`
*   **Columns:** `id` (UUID), `harvest_date`, `weight`, `price`, `bagang_id` (FK), `harvests_season` (FK).
*   **Relationships:**
    *   Links a **Bagang** to a **Season**.
    *   Records daily production.

**5. Harvest Types (Catch Type)**
*   **Table:** `harvest_types`
*   **Columns:** `name` (PK/Unique).
*   **Usage:** Used in Sales Details to categorize the product.

### Sales Domain

**6. Sales (Transactions)**
*   **Table:** `sales`
*   **Columns:** `id` (Serial), `customer`, `issued_at`, `is_paid_off`, `paid_off_at`.
*   **Relationships:**
    *   Has many **Sales Details**.
    *   Has many **Transaction Details** (Payments).

**7. Sales Details (Line Items)**
*   **Table:** `sales_details`
*   **Columns:** `id` (Serial), `sales_id` (FK), `harvest_types` (FK), `weight`, `price`.

**8. Transaction Details (Payments)**
*   **Table:** `transaction_details`
*   **Columns:** `id` (Serial), `sales_id` (FK), `amount`, `paid_at`.

### Customer Domain (New Jan 2026)

**9. Customers (Pelanggan)**
*   **Table:** `customers`
*   **Columns:** `id` (UUID), `name`, `contact`, `address`, `created_at`, `updated_at`.
*   **Usage:** Master data for Sales.

## Current State (Jan 2026)
*   **Active Features:** 
    *   **Bagang:** List and Create.
    *   **Sales:** Search (Listing) and Create.
    *   **Master Data:** Listing for Harvest Types, Production Cost Types, Workers, Seasons, and Customers.
    *   **Season Control:** "End Season" logic (Transactional close/open).
*   **Inactive/Commented Features:** User, Contact, and Address features remain in the codebase but are inactive.
*   **Routes:** Active endpoints include `/api/bagang`, `/api/sales`, `/api/harvest-types`, `/api/production-cost-types`, `/api/workers`, `/api/customers`, and `/api/seasons`.
*   **Updates (Jan 12, 2026):**
    *   **Customer Feature:** Added full CRUD for Customers.
    *   **Sales Creation:** Implemented `POST /api/sales` to allow creating new sales transactions.
    *   **Sales Management:** Implemented full CRUD for Sales Items and Payments.
    *   **Logic:** Added logic to auto-calculate and update `IsPaidOff` status based on total items vs total payments.
    *   **Repositories:** Added `SalesDetailRepository`, `TransactionDetailRepository`, and `CustomerRepository`.
    *   **Search & Filter:** Implemented server-side search and filtering for **Sales**, **Bagang**, and **Customer**.

## How to Add a New Feature (Backend)

1.  **Entity (Database Layer):**
    *   Create `internal/entity/[feature]_entity.go`.
    *   Define the struct with GORM tags.

2.  **Model (DTO Layer):**
    *   Create `internal/model/[feature]_model.go`.
    *   Define Request and Response structs.
    *   Create a converter/mapper function if needed.

3.  **Repository (Data Access):**
    *   Create `internal/repository/[feature]_repository.go`.
    *   Implement CRUD operations using `gorm.DB`.
    *   *Convention:* Methods should accept `*gorm.DB` to support transactions if passed from UseCase.

4.  **UseCase (Business Logic):**
    *   Create `internal/usecase/[feature]_usecase.go`.
    *   Inject `*repository.[Feature]Repository`, `*validator.Validate`, etc.
    *   Implement business rules.

5.  **Controller (HTTP Layer):**
    *   Create `internal/delivery/http/[feature]_controller.go`.
    *   Inject `*usecase.[Feature]UseCase`.
    *   Parse body, validate, call UseCase, and return `WebResponse`.

6.  **Wiring (Dependency Injection):**
    *   Open `internal/config/app.go`.
    *   Initialize Repository -> UseCase -> Controller.
    *   Add Controller to `route.RouteConfig` struct.

7.  **Routing:**
    *   Open `internal/delivery/http/route/route.go`.
    *   Register the new endpoints in `SetupGuestRoute` or `SetupAuthRoute`.

8.  **Migration:**
    *   Run `migrate create -ext sql -dir db/migrations -seq [migration_name]`.
    *   Fill `up.sql` and `down.sql`.

## Architectural Standards (Updated Jan 2026)
*   **Generic Repository:** The project uses a generic `Repository[T]` struct in `internal/repository/repository.go`.
    *   **Extension:** Added `FindAll(db *gorm.DB, entities *[]T)` to support listing for all entities.
    *   **Mandate:** Always prioritize extending the generic repository for common CRUD before creating specific repository methods.
    *   **Process:** Architectural changes must be approved by the user.