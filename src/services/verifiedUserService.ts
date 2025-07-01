import { Snowflake } from "discord.js";
import { Pool } from "mysql2/promise";

import { VerifiedUserRepo } from "@database/repos/verifiedUserRepo";
import { getDateTime } from "@util/time";

export enum VerifiedUserStatus {
  Success = "Success",
  SnowflakeAlreadyExists = "Your account is already verified under a different email",
  EmailAlreadyExists = "This email has already been used to verify a different user",
  UserAlreadyExists = "You are already verified",
  UserDoesNotExist = "You have not been verified yet",
}

class VerifiedUserService {
  private repo: VerifiedUserRepo;

  constructor(pool: Pool) {
    this.repo = new VerifiedUserRepo(pool);
  }

  async isVerified(snowflake: Snowflake) {
    return Boolean(await this.repo.findBySnowflake(snowflake));
  }

  async verifyUser(snowflake: Snowflake, email: string) {
    const alreadySnowflake = await this.repo.findBySnowflake(snowflake);
    const alreadyEmail = await this.repo.findByEmail(email);

    if (alreadySnowflake && alreadyEmail)
      return VerifiedUserStatus.UserAlreadyExists;

    if (alreadySnowflake) return VerifiedUserStatus.SnowflakeAlreadyExists;

    if (alreadyEmail) return VerifiedUserStatus.EmailAlreadyExists;

    await this.repo.create({
      snowflake: snowflake,
      email: email,
      dateVerified: getDateTime(),
    });

    return VerifiedUserStatus.Success;
  }

  async unverifyUser(snowflake: Snowflake) {
    const user = await this.repo.findBySnowflake(snowflake);
    if (!user) return VerifiedUserStatus.UserDoesNotExist;

    await this.repo.delete(user.id);
    return VerifiedUserStatus.Success;
  }
}

export function makeVerifiedUserService(pool: Pool) {
  return new VerifiedUserService(pool);
}
