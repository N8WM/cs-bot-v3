## Setup

The following instructions explain how to set up and run the development
environment with a local Postgres database. Requires a system with Docker and Ollama set up, and a discord bot token.

### 0. Install Ollama if you haven't already

Visit [https://ollama.com/download](https://ollama.com/download) to install and set up Ollama.  
To check if it's working, visit [http://localhost:11434](http://localhost:11434) in your browser; it should say something like `Ollama is running`.

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

# Docker <-> Ollama
OLLAMA_HOST=http://host.docker.internal:11434
```

### 3. Spin up database tools (requires Docker)

```sh
npm run db:up  # "npm run db:down"" to spin down
npm run prisma:migrate
```

### 4. Run

```sh
npm run dev
```
