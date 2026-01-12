# Catchery Frontend Analysis & Learning Log

## Project Overview
**Catchery Frontend** is a Single Page Application (SPA) built with **React 19** and **TypeScript**, organized by feature.

## Technology Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **State/Fetching:** TanStack Query (React Query) v5
- **Routing:** React Router v7
- **Forms:** Custom components + Zod validation

## Architecture: Feature-Based
1.  **`src/features/`**: Domain logic (The "Brain").
    *   Each folder (e.g., `bagang`, `harvest`) contains:
        *   `api/`: Service definitions, Zod schemas, Types.
        *   `hooks/`: React Query hooks (`use[Feature]Query`).
2.  **`src/pages/`**: View layer.
    *   Composes features into pages.
3.  **`src/component/`**: Reusable UI blocks.

## Current State (Jan 2026)
*   **Active Features:** Bagang, Sales, Seasons, Harvest Types, Production Cost Types, and Workers.
*   **Refactored:** The Sales page now uses the standard Service/Hook pattern and connects to the correct `/api/sales` endpoint.
*   **Master Data:** Expanded sidebar navigation for comprehensive data management.
*   **Updates (Jan 12, 2026):**
    *   **UX Enhancements:** Integrated `react-hot-toast` for success/error notifications.
    *   **Component Refactor:** `TextArea` and `Select` components now use `forwardRef` and controlled props for better `react-hook-form` compatibility.
    *   **Table Improvements:** Added "Deskripsi" column with text wrapping to Harvest table.
    *   **Sales Detail:** Implemented full CRUD for Sales Items and Payments with automatic "Paid Off" status calculation.
    *   **UI Tweaks:** Moved "Kembali" buttons to the right side of headers.
    *   **Search & Filter UI:** Added Search (Debounced Input) and Filter (Select) components to `SalesTable` and `BagangTable`, wired to backend search endpoints.

## How to Add a New Feature (Frontend)

1.  **Feature Directory:**
    *   Create `src/features/[new-feature]/`.
    *   **API:** Create `api/[new-feature].service.ts` defining static methods for API calls.
    *   **Types/Schema:** Create `api/[new-feature].type.ts` and `[new-feature].schema.ts` (Zod).
    *   **Hooks:** Create `hooks/use[NewFeature].ts` wrapping `useQuery` or `useMutation`.

2.  **Page Component:**
    *   Create `src/pages/[NewFeature]/page.tsx`.
    *   Import custom hooks from `features/[new-feature]/hooks`.
    *   Build the UI (Tables, Forms) using components from `src/component`.

3.  **Routing:**
    *   Open `src/App.tsx`.
    *   Add a `<Route path="/[path]" element={<[NewFeature]Page />} />`.

4.  **Navigation (Optional):**
    *   Update `src/layout/AppSidebar.tsx` (or config) to add a menu item.

## Key Conventions
*   **Service Pattern:** Do not use `fetch/axios` directly in components. Use the Service class in `features/**/api`.
*   **Query Keys:** Define query keys (constants) in the Service file or a separate constants file to invalidate caches correctly.
*   **Table Data:** Use `BasicTableData` for list views.

## Architectural Standards (Updated Jan 2026)
*   **Backend Alignment:** Ensure frontend services match the backend's clean architecture endpoints (e.g., `/api/[feature]`).

## Component Directory Structure

```
client/src/component/
├── common/
│   ├── PageBreadCrumb.tsx
│   ├── PageMeta.tsx
│   └── ...
├── form/
│   ├── input/
│   │   ├── Checkbox.tsx
│   │   ├── InputField.tsx
│   │   ├── TextArea.tsx
│   │   └── ...
│   ├── Label.tsx
│   ├── Select.tsx
│   └── ...
├── table/
│   ├── BasicTableData.tsx
│   └── ...
└── ui/
    ├── button/
    │   └── Button.tsx
    ├── modal/
    │   └── index.tsx (Modal)
    └── ...
```
*   **Component Usage Mandate:** Do not create new components in `src/component` without explicit user approval. Always verify existing components in `src/component` first and use them even if they require slight adaptation (e.g., using `InputField` with `hint` instead of a custom `InputGroup`).

# Learning Log - Purchase Page Enhancements (Jan 12, 2026)

## Context
The user requested to add search and filter capabilities to the "Purchase" page, similar to the existing "Sales" page.

## Discovery
1.  **Frontend Mapping:** The "Purchase" page (`client/src/pages/Purchase`) displays a list of **Bagangs** (Production Units). Clicking a Bagang navigates to its specific purchase/harvest details.
2.  **Backend Capability:** The `BagangController` (`apis/internal/delivery/http/bagang_controller.go`) already supported a `Search` endpoint accepting `name` and `is_active` parameters via `SearchBagangRequest`.
3.  **Frontend State:** The `PurchaseTable` (previously named `SalesTable` via copy-paste) was fetching all Bagangs and filtering for `is_active` on the client side.

## Implementation
1.  **Component Renaming:** Renamed `SalesTable` to `PurchaseTable` in `client/src/pages/Purchase/table.tsx` and updated the import in `page.tsx` for clarity.
2.  **State Management:** Added React state for `search` (Name) and `statusFilter` (Active/Inactive).
3.  **Debouncing:** Implemented a `useEffect` hook to debounce the search input by 500ms to prevent excessive API calls.
4.  **Query Params:** Constructed a `params` object based on the state (`name` and `is_active`) and passed it to the `useBagangQuery` hook.
5.  **UI Updates:** Added `Input` (Search) and `Select` (Filter) components above the table, mirroring the Sales page layout.
6.  **Logic Update:** Removed client-side filtering; the table now relies on the backend to return the filtered dataset.

## Outcome
The Purchase page now supports server-side searching by Bagang name and filtering by Active/Inactive status, providing a consistent user experience with the Sales page.

# Learning Log - In-Table Search and Filter Implementation

## Context
The user requested to move search and filter inputs directly into the table headers for the "Purchase" page.
-   **Requirement:** Free text fields (Name) use an Input. Enum fields (Status) use a Dropdown.
-   **Target:** `PurchaseTable` component.

## Changes

### 1. Component Architecture (`BasicTableData`)
-   **Type Definition:** Updated `TableHeader` interface in `client/src/component/table/types.ts` to include an optional `filter?: React.ReactNode` property.
-   **Rendering:** Updated `BasicTableData.tsx` to render the `filter` component below the column title if present.
    -   Used a `flex-col` layout within the `TableCell` to stack Title and Filter.
-   **Bug Fix:** Fixed a missing import for `ChevronRightIcon` in `BasicTableData.tsx`.

### 2. Purchase Page (`PurchaseTable`)
-   **Layout Update:** Removed the separate "Search/Filter" UI block above the table.
-   **Column Definition:**
    -   **Name Column:** Added `filter` property rendering an `Input` component for searching Bagang names.
    -   **Status Column:** Added a new column for "Status" (`is_active`) and included a `Select` component in its `filter` property for Active/Inactive filtering.
-   **Styling:** Used `!h-9 text-xs` classes on the Input and Select components to ensure they fit well within the table header without taking up excessive vertical space.
-   **Logic:** Updated state handling to default `statusFilter` to `"all"` to correctly represent the "Show All" state in the controlled Select component (since `value=""` is often treated as a disabled placeholder).

## Outcome
The Purchase table now features integrated search and filter controls directly within the column headers, providing a more compact and context-aware filtering experience.

# Learning Log - Reverting In-Table Search and Filter

## Context
The user found the in-table search and filter implementation aesthetically displeasing ("ugly") and requested a revert to the previous layout where filters are placed above the table.

## Changes

### 1. Component Architecture (`BasicTableData`)
-   **Revert:** Removed the `filter` property support from `TableHeader` interface in `types.ts` and the rendering logic in `BasicTableData.tsx`.
-   **Note:** Kept the `ChevronRightIcon` import/fix as it is a valid bug fix independent of this feature.

### 2. Purchase Page (`PurchaseTable`)
-   **Layout Restoration:** Moved the "Search Name" input and "Status" select dropdown back to a dedicated row above the table.
-   **Column Update:** Removed the "Status" column and the in-header filter definitions.
-   **Functionality:** The server-side search and filtering logic remains active, just triggered from different UI components.

## Outcome
The Purchase page now functions with the standard "Search Bar + Filter Dropdown" layout above the data table, maintaining consistency with the Sales page and satisfying the user's aesthetic preference.

# Learning Log - Localization and Search Enhancement (Jan 12, 2026)

## Context
The user requested two major changes across all table views:
1.  **Search Logic:** Extend client-side search to consider *all* visible columns (not just Name), ensuring a more comprehensive filtering experience.
2.  **Localization:** Replace all English text with **Bahasa Indonesia** in the table interfaces, including headers, buttons, and status labels.

## Changes

### 1. Global Components (`BasicTableData`)
-   **Localization:** Translated UI text:
    -   "Search..." -> "Cari..."
    -   "Loading..." -> "Memuat..."
    -   "No data found" -> "Data tidak ditemukan"
    -   "Showing X to Y of Z entries" -> "Menampilkan X sampai Y dari Z data"

### 2. Feature Tables (Sales, Bagang, Season, HarvestType, ProductionCostType, Worker)
-   **Client-Side Search:** Updated filtering logic in all `table.tsx` files to check against multiple fields.
    -   *Example (Sales):* Checks `customer`, `date` (formatted), `total_amount` (formatted), and `status`.
    -   *Example (Bagang):* Checks `name`, `worker_name`, and `owner_name`.
-   **Localization:**
    -   Renamed column headers (e.g., "Name" -> "Nama", "Actions" -> "Aksi", "Date" -> "Tanggal").
    -   Translated status labels (e.g., "Active" -> "Aktif", "Inactive" -> "Tidak Aktif").
    -   Translated button labels (e.g., "Add" -> "Tambah").
    -   Translated confirmation prompts (e.g., "Are you sure..." -> "Apakah anda yakin...").

## Outcome
The application now provides a consistent, localized user experience in Bahasa Indonesia with powerful, multi-column search capabilities across all main data tables.
