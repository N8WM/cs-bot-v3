const _arr = (strlist: string) => {
  return strlist
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
};

const _config = {
  token: process.env.TOKEN!,
  devGuildIds: _arr(process.env.DEV_GUILD_IDS!),
  dbName: process.env.DB_NAME!,
  dbHost: process.env.DB_HOST!,
  dbUsername: process.env.DB_USERNAME!,
  dbPassword: process.env.DB_PASSWORD!,
  paths: {
    commands: `${__dirname}/commands`,
    events: `${__dirname}/events`,
  },
};

export default _config;
