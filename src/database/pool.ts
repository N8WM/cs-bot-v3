import mysql, { Pool, PoolOptions, RowDataPacket } from "mysql2/promise";

import { Logger } from "@logger";

export type PoolInitOptions = {
  name: string;
  host: string;
  username: string;
  password: string;
};

const DEFAULT_POOL_OPTS: PoolOptions = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  dateStrings: false,
};

function makeOpts(o: PoolInitOptions): PoolOptions {
  return {
    host: o.host,
    user: o.username,
    password: o.password,
    database: o.name,
    ...DEFAULT_POOL_OPTS,
  };
}

export class Database {
  private static _inst?: Database;
  private _opts: PoolOptions;
  private _conn: Pool;

  constructor(options: PoolInitOptions) {
    this._opts = makeOpts(options);
    this._conn = mysql.createPool(this._opts);
  }

  static init(options: PoolInitOptions) {
    if (Database._inst) {
      Logger.error("Multiple instances of Database detected");
      process.exit(1);
    }

    Database._inst = new Database(options);
  }

  static get instance() {
    if (!Database._inst) {
      Logger.error("Database not initialized - Call init() first");
      process.exit(1);
    }

    return Database._inst;
  }

  get options() {
    return this._opts;
  }

  get conn() {
    return this._conn;
  }

  async execute<T extends RowDataPacket>(sql: string, params?: any[]) {
    return await this._conn.execute<T[]>(sql, params);
  }

  async close() {
    await this._conn.end();
    Database._inst = undefined;
  }

  static async close() {
    await Database.instance._conn.end();
    Database._inst = undefined;
  }
}
