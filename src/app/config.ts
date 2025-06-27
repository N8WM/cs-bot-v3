const _arr = (strlist: string) => {
  return strlist
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
};

const _config = {
  token: process.env.TOKEN!,
  devGuildIds: _arr(process.env.DEV_GUILD_IDS!),
  devUserIds: _arr(process.env.DEV_USER_IDS!),
  paths: {
    commands: `${__dirname}/commands`,
    events: `${__dirname}/events`,
  },
};

export default _config;
