import { Snowflake } from "discord.js";

import { User } from "@prisma/client";
import { Result } from "@util/result";
import { BaseService } from "./baseService";

export enum UserStatus {
  Success = "Success",
  SnowflakeAlreadyExists = "This account is already verified under a different email",
  EmailAlreadyExists = "This email has already been used to verify a different user",
  UserAlreadyExists = "This account is already verified",
  UserDoesNotExist = "This account has not been verified yet"
}

export class UserService extends BaseService {
  async get(userSnowflake: Snowflake, guildSnowflake: Snowflake) {
    return await this.prisma.user.findUnique({
      where: {
        userSnowflake_guildSnowflake: { userSnowflake, guildSnowflake }
      }
    });
  }

  async isVerified(userSnowflake: Snowflake, guildSnowflake: Snowflake) {
    return Boolean(await this.get(userSnowflake, guildSnowflake));
  }

  async verifyUser(
    userSnowflake: Snowflake,
    guildSnowflake: Snowflake,
    email: string
  ): Promise<Result<User>> {
    const alreadySnowflake = await this.get(userSnowflake, guildSnowflake);
    const alreadyEmail = await this.prisma.user.findUnique({
      where: { guildSnowflake_email: { guildSnowflake, email } }
    });

    if (alreadySnowflake && alreadyEmail) return Result.err(UserStatus.UserAlreadyExists);
    if (alreadySnowflake) return Result.err(UserStatus.SnowflakeAlreadyExists);
    if (alreadyEmail) return Result.err(UserStatus.EmailAlreadyExists);

    const user = await this.prisma.user.create({
      data: {
        userSnowflake,
        guildSnowflake,
        email
      }
    });

    return Result.ok(user);
  }

  async unverifyUser(
    userSnowflake: Snowflake,
    guildSnowflake: Snowflake
  ): Promise<Result<User>> {
    const user = await this.get(userSnowflake, guildSnowflake);
    if (!user) return Result.err(UserStatus.UserDoesNotExist);

    const deleted = await this.prisma.user.delete({
      where: {
        userSnowflake_guildSnowflake: { userSnowflake, guildSnowflake }
      }
    });

    return Result.ok(deleted);
  }
}
