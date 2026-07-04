# Smart Office Monitoring System

A full-stack monitoring system for tracking office device state (lights and fans) in real-time, featuring a React dashboard and a conversational Discord Bot powered by Groq.

## Project Structure

System Diagram and Circuit Diagram provided under Diagram Folder in the repo
This is a pnpm monorepo containing three applications:
- `apps/backend`: Node.js Express server with Socket.io and Supabase integration. It also runs the device state simulator.
- `apps/dashboard`: React + Vite + Tailwind CSS dashboard providing real-time visual state and power consumption.
- `apps/bot`: A discord.js bot leveraging the Groq API (`llama-3.3-70b-versatile`) to provide conversational system status.
- `packages/shared-types`: Shared TypeScript interfaces across all applications.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Fill in the following variables:
- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_KEY`: Your Supabase service role key.
- `DISCORD_TOKEN`: Your Discord bot token.
- `GROQ_API_KEY`: Your Groq API key for LLM phrasing.

### 2. Database Initialization

Execute the SQL script located at `supabase/schema.sql` in your Supabase project's SQL editor to create the necessary tables (`devices` and `alerts`). The Node.js backend will automatically seed the initial 15 devices when it starts for the first time.

### 3. Install Dependencies

In the root of the project, run:

```bash
npm install -g pnpm  # if you don't have pnpm installed
pnpm install
```

### 4. Running the Applications

#### Run Everything Concurrently

To start the backend, dashboard, and bot at the same time:

```bash
pnpm run dev
```

#### Run Individually

- **Backend**: `cd apps/backend && pnpm run dev`
- **Dashboard**: `cd apps/dashboard && pnpm run dev`
- **Discord Bot**: `cd apps/bot && pnpm run dev`

### Testing

Tests are written using Vitest and Supertest. To run the full test suite across all workspace projects:

```bash
pnpm test
```

## Documentation

- **Hardware Schematic Notes**: Found in `docs/hardware-schematic-notes.md`.
- **System Diagram**: Found in `docs/system-diagram.svg`.
