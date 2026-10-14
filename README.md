# Financial Analytics Dashboard

A responsive, feature-complete financial analytics and enterprise governance application rewritten in React (Vite) with Tailwind CSS, Recharts, and TanStack Query.

## Features

- **Stock Price Trend (Line Chart):** Historical close price analysis for major symbols (IBM, AAPL, MSFT, GOOGL, AMZN, TSLA) with custom time range filtering (1 Month, 3 Months, 6 Months, 1 Year, All Time).
- **Sector Performance (Pie Chart):** Distribution of real-time sector performance across Technology, Financials, Healthcare, Consumer, Energy, and more.
- **Market Movers & Heatmap:** Top Gainers and Top Losers ranking with visual color-coded market performance heatmap and most actively traded volume tables.
- **Composite Stock Score Calculator:** Quantitative stock rating generated from volatility (annualized standard deviation), 5-day growth rate, and average trading volume.
- **Enterprise Role-Based Access Control (RBAC):**
  - Fine-grained permission definitions (e.g. `market.read`, `todos.*`, `users.*`, `roles.*`, `menus.*`, `audit.*`).
  - System and custom roles (Administrator, Auditor, Standard User).
  - Dynamic navigation menu tree resolved based on effective permissions.
  - Per-user permission overrides (`allow` / `deny`).
  - Demo quick-switch profile bar for testing different permission sets.
- **Task Management (To-dos):** Task tracking with lifecycle state transitions (`open` → `in_progress` → `completed`), priority levels (`urgent`, `high`, `normal`, `low`), assignees, and due dates.
- **Security & Audit Logging:** Immutable audit trail tracking user creation, role assignments, to-do state changes, and logins, with CSV export capabilities.

## Tech Stack

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS v4
- **State & Data Fetching:** TanStack React Query v5
- **Routing:** React Router v7
- **Charts:** Recharts
- **Date Handling:** date-fns

## Running the App

```bash
npm install
npm run dev
```

The application runs on `http://0.0.0.0:3000`.
