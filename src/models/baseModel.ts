import { RowDataPacket } from "mysql2/promise";

export interface BaseModel extends RowDataPacket{
  id: number;
}
