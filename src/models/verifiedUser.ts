import { Snowflake } from "discord.js";
import { BaseModel } from "@models/baseModel";

export interface VerifiedUser extends BaseModel {
  id: number;
  snowflake: Snowflake;
  email: string;
  dateVerified: string;
}
