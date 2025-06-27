declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      TOKEN?: string;
      DEV_GUILD_IDS?: string;
      DEV_USER_IDS?: string;
    }
  }
}

export {}
