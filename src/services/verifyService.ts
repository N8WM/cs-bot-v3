import { Snowflake } from "discord.js";

import { BaseService } from "./baseService";
import { VerifySettings } from "@generated/prisma";
import { getDateTime } from "@util/time";

export enum VerifyStatus {
  Success = "Success",
  GuildSnowflakeAlreadyExists = "This server is already registered",
  VerificationDisabled = "This server does not have verification enabled",
  VerificationEnabled = "This server already has verification enabled",
}

export class VerifyService extends BaseService {
  async get(guildSnowflake: Snowflake) {
    return await this.prisma.verifySettings.findUnique({
      where: { guildSnowflake },
    });
  }

  isEnabled(verify: VerifySettings | null): verify is VerifySettings {
    return verify !== null;
  }

  async enable(
    guildSnowflake: Snowflake,
    roleId: string,
    suffix: string,
    gmailAddress: string,
    gmailPassword: string,
  ) {
    const existing = await this.get(guildSnowflake);

    if (this.isEnabled(existing)) return VerifyStatus.VerificationEnabled;

    const dateAdded = getDateTime();

    return await this.prisma.verifySettings.create({
      data: {
        guildSnowflake,
        roleId,
        suffix,
        gmailAddress,
        gmailPassword,
        dateAdded,
      },
    });
  }

  async disable(guildSnowflake: Snowflake) {
    const existing = await this.get(guildSnowflake);
    if (!this.isEnabled(existing)) return VerifyStatus.VerificationDisabled;

    await this.prisma.verifySettings.delete({ where: { guildSnowflake } });
  }
}
