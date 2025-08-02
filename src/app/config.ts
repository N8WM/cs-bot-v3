const _arr = (strlist: string) => {
  return strlist
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
};

const _config = {
  token: process.env.TOKEN!,
  devGuildIds: _arr(process.env.DEV_GUILD_IDS!),
  gmailAddress: process.env.GMAIL_ADDRESS!,
  gmailPassword: process.env.GMAIL_PASSWORD!,
  databaseUrl: process.env.DATABASE_URL!,
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ?? null,
  paths: {
    commands: `${__dirname}/commands`,
    events: `${__dirname}/events`,
  },
};

export default _config;
