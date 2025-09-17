import { Snowflake } from "discord.js";

import { VerifySettings } from "@prisma/client";
import { Result } from "@util/result";
import { BaseService } from "./baseService";

export enum VerifyStatus {
  Success = "Success",
  GuildSnowflakeDoesNotExist = "This server has not been registered.",
  VerificationDisabled = "This server does not have verification enabled",
  VerificationEnabled = "This server already has verification enabled"
}

export class VerifyService extends BaseService {
  async get(guildSnowflake: Snowflake) {
    return await this.prisma.verifySettings.findUnique({
      where: { guildSnowflake }
    });
  }

  isEnabled(verify: VerifySettings | null): verify is VerifySettings {
    return verify !== null;
  }

  async enable(
    guildSnowflake: Snowflake,
    roleId: string,
    suffix: string
  ): Promise<Result<VerifySettings>> {
    const existing = await this.get(guildSnowflake);

    if (this.isEnabled(existing))
      await this.prisma.verifySettings.delete({ where: { guildSnowflake } });

    const registered = await this.prisma.guild.findUnique({
      where: { snowflake: guildSnowflake }
    });

    if (registered === null)
      return Result.err(VerifyStatus.GuildSnowflakeDoesNotExist);

    const settings = await this.prisma.verifySettings.create({
      data: {
        guildSnowflake,
        roleId,
        suffix
      }
    });

    return Result.ok(settings);
  }

  async disable(guildSnowflake: Snowflake): Promise<Result<VerifySettings>> {
    const existing = await this.get(guildSnowflake);
    if (!this.isEnabled(existing))
      return Result.err(VerifyStatus.VerificationDisabled);

    const settings = await this.prisma.verifySettings.delete({
      where: { guildSnowflake }
    });
    await this.prisma.user.deleteMany({ where: { guildSnowflake } });

    return Result.ok(settings);
  }
}
