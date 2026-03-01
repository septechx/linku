# Linku

A modern link management and URL shortening platform with organization support.

## Features

- **Link Shortening** – Create shortened URLs with custom slugs
- **Organization Support** – Manage links across multiple organizations/teams
- **Global Links** – Create organization-agnostic short links
- **User Authentication** – Secure email/password authentication via Better Auth
- **Dashboard** – Intuitive interface for managing links and tracking clicks

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 1. Set up environment variables

Create a `.env.local` file in the project root, you can use `.env.example` for testing.

```bash
cp .env.example .env.local
```

> **Note**: Generate a secure secret for production using `openssl rand -base64 32`

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
pnpm build
```

This creates an optimized production build in the `.next` directory.

To start the production server:

```bash
pnpm start
```

## Available Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start development server with hot reload |
| `pnpm build`        | Create production build                  |
| `pnpm start`        | Start production server                  |
| `pnpm lint`         | Run ESLint                               |
| `pnpm format`       | Format code with Prettier                |
| `pnpm format:check` | Check code formatting                    |
| `pnpm typecheck`    | Run TypeScript type checking             |
| `pnpm db:generate`  | Generate Drizzle migrations              |
| `pnpm db:migrate`   | Run database migrations                  |

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See [LICENSE](./LICENSE) for details.
