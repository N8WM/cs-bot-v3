# cs-bot-v3
## Setup
The following instructions explain how to set up and run the development environment. A MySQL or MariaDB database is required (see `.env` file step for linking).

### 1. Clone and Initialize
```sh
git clone https://github.com/N8WM/cs-bot-v3.git
cd cs-bot-v3
npm i
```

### 2. Set up your `.env` file
**Placeholder `.env`**:
```env
TOKEN="discordToken"
DEV_GUILD_IDS="devServer1Id,devServer2Id"

DATABASE_URL="mysql://johndoe:randompassword@localhost:3306/mydb"
# If lacking db add/drop perms, set up a shadow:
# SHADOW_DATABASE_URL="mysql://johndoe:randompassword@localhost:3306/mydb"
```

### 3. Migrate Database
```sh
npx prisma migrate reset
npx prisma migrate dev --name init
```

### 4. Run
```sh
npm run dev
```
