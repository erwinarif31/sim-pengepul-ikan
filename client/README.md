# Catchery client

## Playwright E2E

Prerequisites: running API at `http://localhost:8888`, PostgreSQL and `psql`, Go, pnpm dependencies, and test database values in `apis/config.json`.

E2E reset truncates and reseeds configured database. Use only disposable test data. Package scripts confirm the exact local `localhost:5432/catchery` test database:

```sh
pnpm e2e
```

Direct `playwright test` stays blocked because it bypasses that confirmation.

```sh
pnpm e2e:headed # normal speed
pnpm e2e:slow   # headed, 500 ms between browser actions
pnpm e2e:debug  # step through actions manually
```

Tests already run serially (`workers: 1`). Select one file or test:

```sh
pnpm e2e:slow e2e/auth-rbac.spec.ts
pnpm e2e:slow --grep "auth validates"
```

Install browser once with `pnpm exec playwright install chromium`. Start API from `apis` with `go run cmd/web/main.go` (or `air`). E2E starts Vite when no server already runs.

Useful commands: `pnpm e2e:headed`, `pnpm e2e:debug`, and `pnpm e2e:reset` (requires same confirmation environment).
