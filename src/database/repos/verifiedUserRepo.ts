import { Snowflake } from "discord.js";
import { Pool } from "mysql2/promise";

import { VerifiedUser } from "@models/verifiedUser";
import { BaseRepo } from "../baseRepo";

export class VerifiedUserRepo extends BaseRepo<VerifiedUser> {
  constructor(pool: Pool) {
    super("VerifiedUsers", pool);
  }

  async findBySnowflake(snowflake: Snowflake): Promise<VerifiedUser | null> {
    const sql = `SELECT * FROM \`${this.table}\` WHERE \`snowflake\` = ? LIMIT 1`;
    const [rows] = await this.pool.execute<VerifiedUser[]>(sql, [snowflake]);
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<VerifiedUser | null> {
    const sql = `SELECT * FROM \`${this.table}\` WHERE \`email\` = ? LIMIT 1`;
    const [rows] = await this.pool.execute<VerifiedUser[]>(sql, [email]);
    return rows[0] ?? null;
  }
}
