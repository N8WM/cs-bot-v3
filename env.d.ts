declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      TOKEN?: string;
      DEV_GUILD_IDS?: string;
      DATABASE_URL?: string;
      SHADOW_DATABASE_URL?: string;
    }
  }
}

export { };
