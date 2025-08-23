# cs-bot-v3

## Setup

The following instructions explain how to set up and run the development
environment with a local Postgres database. Requires Docker.

### 1. Clone and initialize

```sh
git clone https://github.com/N8WM/cs-bot-v3.git
cd cs-bot-v3
npm i
```

### 2. Set up `.env` file

**Example `.env`** (copied from the provided `.env.example`):

```env
# App
TOKEN=change_me
DEV_GUILD_IDS=change_me
GMAIL_ADDRESS=change_me@gmail.com
GMAIL_PASSWORD=change_me

# Prisma
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
```

### 3. Set up the local database (requires Docker)

```sh
npm run db:up
npm run prisma:deploy
```

### 4. Run

```sh
npm run dev
```
