import { Snowflake } from "discord.js";

import { Guild } from "@prisma/client";
import { Result } from "@util/result";
import { BaseService } from "./baseService";

export enum GuildStatus {
  Success = "Success",
  SnowflakeAlreadyExists = "This server is already registered",
  SnowflakeDoesNotExist = "This server is not registered",
}

export class GuildService extends BaseService {
  async get(snowflake: Snowflake) {
    return await this.prisma.guild.findUnique({ where: { snowflake } });
  }

  async refreshGuilds(snowflakes: Snowflake[]) {
    await this.prisma.guild.deleteMany({
      where: { snowflake: { notIn: snowflakes } },
    });

    const update = await this.prisma.guild.updateMany({
      where: { snowflake: { in: snowflakes } },
      data: { updatedAt: new Date() },
    });

    return update.count;
  }

  async registerGuild(
    snowflake: Snowflake,
    contactEmail: string,
  ): Promise<Result<Guild>> {
    if (await this.get(snowflake))
      return Result.err(GuildStatus.SnowflakeAlreadyExists);

    const guild = await this.prisma.guild.create({
      data: {
        snowflake,
        contactEmail,
      },
    });

    return Result.ok(guild);
  }

  async unregisterGuild(snowflake: Snowflake): Promise<Result<Guild>> {
    if (!(await this.get(snowflake)))
      return Result.err(GuildStatus.SnowflakeDoesNotExist);

    await this.prisma.user.deleteMany({ where: { guildSnowflake: snowflake} });
    await this.prisma.verifySettings.delete( { where: { guildSnowflake: snowflake } });
    const guild = await this.prisma.guild.delete({ where: { snowflake } });

    return Result.ok(guild);
  }

  async updateContactEmail(
    snowflake: Snowflake,
    contactEmail: string,
  ): Promise<Result<Guild>> {
    if (!(await this.get(snowflake)))
      return Result.err(GuildStatus.SnowflakeDoesNotExist);

    const guild = await this.prisma.guild.update({
      where: { snowflake },
      data: { contactEmail },
    });

    return Result.ok(guild);
  }
}
