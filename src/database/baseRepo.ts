import { BaseModel } from "@models/baseModel";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type Identifier = number;

export interface CRUD<T extends BaseModel> {
  create(item: Omit<T, "id">): Promise<T>;
  findById(id: Identifier): Promise<T | null>;
  update(id: Identifier, item: Partial<Omit<T, "id">>): Promise<void>;
  delete(id: Identifier): Promise<void>;
  list(where?: Partial<T>, limit?: number, offset?: number): Promise<T[]>;
  count(where?: Partial<T>): Promise<number>;
}

export abstract class BaseRepo<T extends BaseModel> implements CRUD<T> {
  constructor(
    protected table: string,
    protected pool: Pool,
  ) { }

  async create(item: Omit<T, "id">) {
    const cols = Object.keys(item);
    const sql = `INSERT INTO \`${this.table}\` (${quot(cols)}) VALUES (${cols.map((c) => `:${c}`).join(", ")})`;

    const [result] = await this.pool.execute<ResultSetHeader>(sql, item);
    const row = await this.findById(result.insertId);

    if (!row) throw new Error(`Failed to insert row in ${this.table}`);
    return row;
  }

  async findById(id: Identifier): Promise<T | null> {
    const sql = `SELECT * FROM \`${this.table}\` WHERE \`id\` = ? LIMIT 1`;
    const [rows] = await this.pool.execute<T[]>(sql, [id]);
    return rows[0] ?? null;
  }

  async update(id: Identifier, item: Partial<Omit<T, "id">>) {
    const cols = Object.keys(item);
    if (cols.length === 0) return;

    const assignments = cols.map((c) => `\`${c}\` = :${c}`).join(", ");
    const sql = `UPDATE \`${this.table}\` SET ${assignments} WHERE \`id\` = :id`;

    await this.pool.execute(sql, { ...item, id });
  }

  async delete(id: Identifier) {
    const sql = `DELETE FROM \`${this.table}\` WHERE \`id\` = ?`;
    await this.pool.execute(sql, [id]);
  }

  async list(where: Partial<T> = {}, limit?: number, offset?: number) {
    const cols = Object.keys(where);

    const whereClause = cols.length
      ? "WHERE " + cols.map((c) => `\`${c}\` = :${c}`).join(" AND ")
      : "";

    const sql = [
      `SELECT * FROM \`${this.table}\``,
      whereClause,
      limit != null ? `LIMIT ${limit}` : "",
      offset != null ? `OFFSET ${offset}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const [rows] = await this.pool.execute<T[]>(sql, where);
    return rows;
  }

  async count(where: Partial<T> = {}) {
    const cols = Object.keys(where);

    const whereClause = cols.length
      ? "WHERE" + cols.map((c) => `\`${c}\` = :${c}`).join(" AND ")
      : "";

    const sql = [
      `SELECT COUNT(*) AS count FROM \`${this.table}\``,
      `${whereClause}`,
    ]
      .filter(Boolean)
      .join(" ");

    const [rows] = await this.pool.execute<
      (RowDataPacket & { count: number })[]
    >(sql, where);
    return rows[0]?.count ?? 0;
  }
}

export function quot(cols: string[]) {
  return cols.map((i) => `\`${i}\``).join(", ");
}

export function eprep(cols: string[]) {
  return cols.map(() => "?").join(", ");
}
