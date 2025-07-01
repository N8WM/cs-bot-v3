declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      TOKEN?: string;
      DEV_GUILD_IDS?: string;

      DB_NAME?: string;
      DB_HOST?: string;
      DB_USERNAME?: string;
      DB_PASSWORD?: string;
    }
  }
}

export { };
