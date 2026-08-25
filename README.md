# HelpDeskIt Web Client

HelpDeskIt is a comprehensive IT Helpdesk and Asset Management web application. It provides an intuitive interface for tracking IT assets (computers, network devices, buildings, rooms) and streamlining helpdesk operations with a robust ticketing system.

## Features

- **Ticketing System:** Create, assign, track, and manage IT support tickets with custom statuses and priorities.
- **Asset Management:** Manage buildings, rooms, computers, and network devices with hierarchical organization.
- **User Management:** Role-based access control and user administration.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Dark/Light Mode:** Full theming support.

## Tech Stack

This frontend is built with a modern, high-performance React stack:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Server State Management:** [React Query v5](https://tanstack.com/query/latest)
- **Client State Management:** [Zustand v5](https://github.com/pmndrs/zustand)
- **URL State Management:** [nuqs](https://nuqs.47ng.com/)

## Architecture & Best Practices

The application is structured to ensure security, performance, and maintainability. Key architectural decisions include:

- **Strict State Separation:** `Zustand` is used strictly for ephemeral UI state (e.g., sidebar toggles) and synchronous client data (e.g., currently authenticated user). `React Query` handles all async server state.
- **Secure Authentication:** JWT tokens are stored securely in `httpOnly` cookies. The browser never touches the token directly. API calls from the client hit a Next.js proxy route (`/api/[...proxy]`) which relays the session cookies to the backend.
- **Optimistic Updates:** React Query mutations use optimistic UI updates for instant feedback on actions like changing ticket statuses or assigning users, with automatic rollbacks if the server rejects the change.
- **URL-Driven State:** Complex filter states (e.g., for ticket lists) are stored in the URL search params using `nuqs`, enabling shareable, bookmarkable views and seamless SSR.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22+ recommended)
- `npm`, `yarn`, or `pnpm`

### Installation

1. Clone the repository and navigate to this web directory.
2. Install dependencies:

```bash
pnpm install
# or npm install / yarn install
```

### Environment Variables

Create a `.env.local` or `.env` file in the root of the project with the following variables:

```env
# The actual URL of your backend API server
BACKEND_URL=http://localhost:5006

# The base URL for client-side fetches to hit the Next.js proxy
# Client calls use the relative /api proxy automatically; no public backend URL is needed.
```

### Running the Application

Start the development server:

```bash
pnpm dev
# or npm run dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app`: Next.js App Router pages, layouts, and server actions.
- `/actions`: Next.js Server Actions (e.g., Auth logic).
- `/components`: Reusable React components (shadcn/ui components in `/ui`).
- `/hooks`: Custom React Query hooks organized by domain (`use-tickets.ts`, `use-buildings.ts`, etc.).
- `/stores`: Zustand stores for client-side state (`auth-store.ts`, `ui-store.ts`).
- `/lib`: Utility functions, API clients, and the central Query Key factory.
- `/types`: Shared TypeScript definitions.
