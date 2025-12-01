# fiscal\_ - Personal Finance Manager

A modern personal finance management application built with TanStack Start, tRPC, Drizzle ORM, and Better Auth.

## Features

- **Authentication**: Email/password authentication with Better Auth
- **Protected Routes**: User-scoped data access with tRPC
- **Dashboard**: Overview of accounts, transactions, and balances
- **Account Management**: Track multiple financial accounts
- **Budget Tracking**: Create and monitor budgets with progress indicators
- **Savings Goals**: Set and track savings goals
- **System Categories**: Pre-seeded income and expense categories

## Tech Stack

- **Frontend**: React 19, TanStack Router, TanStack Query
- **Backend**: TanStack Start, tRPC
- **Database**: SQLite with Drizzle ORM
- **Auth**: Better Auth
- **Styling**: Tailwind CSS 4

# Getting Started

## Installation

```bash
pnpm install
```

## Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your values:
   - **FINNHUB_API_KEY**: Get your free API key at https://finnhub.io/register
   - **BETTER_AUTH_SECRET**: Generate a secure random string (required for production):
     ```bash
     openssl rand -base64 32
     ```
   - **SERVER_URL**: Your server URL (default: http://localhost:3000)
   - **VITE_APP_TITLE**: Your app title (optional)

## Database Setup

1. Initialize the database:

```bash
pnpm db:push
```

2. Seed system categories:

```bash
pnpm db:seed
```

## Running the App

```bash
pnpm dev
```

The app will be available at http://localhost:3000

## First Time Setup

1. Visit http://localhost:3000
2. You'll be redirected to the login page
3. Click "Sign Up" to create an account
4. Enter your email and password
5. You'll be redirected to the dashboard

# Building For Production

```bash
pnpm build
```

## Database Management

- **Generate migration**: `pnpm db:generate`
- **Push schema**: `pnpm db:push`
- **Open Drizzle Studio**: `pnpm db:studio`
- **Seed database**: `pnpm db:seed`

## Testing

This project uses [Vitest](https://vitest.dev/) for testing with React Testing Library.

### Run Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (auto-reruns on file changes)
pnpm test:watch

# Run tests with interactive UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

### Test Structure

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx        # Component tests
├── db/
│   └── schema/
│       ├── categories.ts
│       └── categories.test.ts     # Schema type tests
├── lib/
│   ├── utils.ts
│   └── utils.test.ts              # Utility function tests
└── test/
    ├── setup.ts                   # Test configuration
    └── business-logic.test.ts     # Business logic tests
```

### Writing Tests

#### Unit Tests (Utilities)

```ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./utils";

describe("formatCurrency", () => {
  it("should format IDR currency correctly", () => {
    expect(formatCurrency(1000000)).toBe("Rp 1.000.000");
  });

  it("should handle negative values", () => {
    expect(formatCurrency(-500000)).toBe("-Rp 500.000");
  });
});
```

#### Component Tests

```ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeDefined()
  })

  it('should handle click events', () => {
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Click</Button>)
    screen.getByRole('button').click()
    expect(clicked).toBe(true)
  })
})
```

#### Business Logic Tests

```ts
import { describe, it, expect } from "vitest";

describe("Transaction validation", () => {
  it("should reject zero amount", () => {
    const isValid = validateAmount(0);
    expect(isValid).toBe(false);
  });

  it("should accept positive amount", () => {
    const isValid = validateAmount(100);
    expect(isValid).toBe(true);
  });
});
```

### Test Coverage

Run `pnpm test:coverage` to generate a coverage report. The report will be available in the `coverage/` directory.

Current test files:

- `src/lib/utils.test.ts` - Utility function tests
- `src/components/ui/button.test.tsx` - Button component tests
- `src/db/schema/categories.test.ts` - Category schema validation
- `src/test/business-logic.test.ts` - Business logic validation

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
pnpm lint
pnpm format
pnpm check
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/              # Reusable UI components (shadcn)
│   ├── FiscalHeader.tsx # App header with logout
│   └── ProtectedRoute.tsx # Auth wrapper
├── db/
│   ├── schema/          # Drizzle schema definitions
│   ├── seed.ts          # Database seed script
│   └── index.ts         # Database connection
├── integrations/
│   └── trpc/            # tRPC setup
│       ├── router.ts      # Main router
│       ├── routers/       # Individual routers
│       └── react.ts       # React tRPC client
├── lib/
│   ├── auth.ts          # Better Auth config
│   └── auth-client.ts   # Auth client utilities
├── routes/              # File-based routing
│   ├── __root.tsx         # Root layout
│   ├── index.tsx          # Dashboard
│   ├── login.tsx          # Login/signup page
│   ├── accounts.tsx       # Accounts page
│   ├── budgets.tsx        # Budgets page
│   ├── goals.tsx          # Savings goals page
│   └── transactions/      # Transaction routes
└── test/                # Test setup and utilities
```

## Learn More

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://www.better-auth.com)
- [Vitest](https://vitest.dev)
