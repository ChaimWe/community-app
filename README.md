# CommunityApp

A clean, web-based community CRM and event seating planner for a small admin team.

## Stack
- React + TypeScript + Vite
- Ant Design
- React Query
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Zod validation
- JWT + bcrypt authentication

## Project structure

```text
apps/
  server/       API, business logic, database models
  web/          React application
packages/
  shared/       Shared TypeScript types and enums
scripts/
  import-members.mjs
```

The code intentionally separates routes, controllers, services, models and validation so it stays readable as the application grows.

## Requirements
- Node.js 20+
- MongoDB 7+ (local or Atlas)

## Setup

```bash
npm install
cp apps/server/.env.example apps/server/.env
npm run dev
```

Web: http://localhost:5173
API: http://localhost:4000

Default seed admin is configured in `.env.example`. Change it before using a real deployment.

## Import the existing member JSON

The existing `data/members.json` is included as the starting dataset. After configuring MongoDB:

```bash
npm run import:members
```

The importer preserves the old fields and maps them into the new member model. It does not invent relationships/groups/connections.

## Production notes
- Use HTTPS behind a reverse proxy.
- Set a strong JWT secret and admin password.
- Restrict MongoDB network access.
- Configure secure cookie settings if moving from local development to production.
- Back up MongoDB regularly.
