import { Snowflake } from "discord.js";

import { BaseService } from "./baseService";
import { getDateTime } from "@util/time";

export enum GuildStatus {
  Success = "Success",
  SnowflakeAlreadyExists = "This server is already registered",
  SnowflakeDoesNotExist = "This server is not registered",
}

export class GuildService extends BaseService {
  async get(snowflake: Snowflake) {
    return await this.prisma.guild.findUnique({ where: { snowflake } });
  }

  async registerGuild(snowflake: Snowflake, contactEmail: string) {
    if (await this.get(snowflake)) return GuildStatus.SnowflakeAlreadyExists;

    const dateAdded = getDateTime();

    await this.prisma.guild.create({
      data: {
        snowflake,
        contactEmail,
        dateAdded,
      },
    });

    return GuildStatus.Success;
  }

  async updateContactEmail(snowflake: Snowflake, contactEmail: string) {
    if (!(await this.get(snowflake))) return GuildStatus.SnowflakeDoesNotExist;

    await this.prisma.guild.update({
      where: { snowflake },
      data: { contactEmail },
    });
    return GuildStatus.Success;
  }
}
