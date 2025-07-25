import { Snowflake } from "discord.js";

import { BaseService } from "./baseService";
import { getDateTime } from "@util/time";

export enum UserStatus {
  Success = "Success",
  SnowflakeAlreadyExists = "This account is already verified under a different email",
  EmailAlreadyExists = "This email has already been used to verify a different user",
  UserAlreadyExists = "This account is already verified",
  UserDoesNotExist = "This account has not been verified yet",
}

export class UserService extends BaseService {
  async get(userSnowflake: Snowflake, guildSnowflake: Snowflake) {
    return await this.prisma.user.findUnique({
      where: {
        userSnowflake_guildSnowflake: { userSnowflake, guildSnowflake },
      },
    });
  }

  async isVerified(userSnowflake: Snowflake, guildSnowflake: Snowflake) {
    return Boolean(await this.get(userSnowflake, guildSnowflake));
  }

  async verifyUser(
    userSnowflake: Snowflake,
    guildSnowflake: Snowflake,
    email: string,
  ) {
    const alreadySnowflake = await this.get(userSnowflake, guildSnowflake);
    const alreadyEmail = await this.prisma.user.findUnique({
      where: { guildSnowflake_email: { guildSnowflake, email } },
    });

    if (alreadySnowflake && alreadyEmail) return UserStatus.UserAlreadyExists;
    if (alreadySnowflake) return UserStatus.SnowflakeAlreadyExists;
    if (alreadyEmail) return UserStatus.EmailAlreadyExists;

    const dateAdded = getDateTime();

    await this.prisma.user.create({
      data: {
        userSnowflake,
        guildSnowflake,
        email,
        dateAdded,
      },
    });

    return UserStatus.Success;
  }

  async unverifyUser(userSnowflake: Snowflake, guildSnowflake: Snowflake) {
    const user = await this.get(userSnowflake, guildSnowflake);
    if (!user) return UserStatus.UserDoesNotExist;

    await this.prisma.user.delete({
      where: {
        userSnowflake_guildSnowflake: { userSnowflake, guildSnowflake },
      },
    });

    return UserStatus.Success;
  }
}
