declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      TOKEN?: string;
      DEV_GUILD_IDS?: string;
      GMAIL_ADDRESS?: string;
      GMAIL_PASSWORD?: string;
      DATABASE_URL?: string;
    }
  }
}

export { };
