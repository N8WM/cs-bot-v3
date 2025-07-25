import { Logger } from "@logger";
import { PrismaClient } from "@generated/prisma";

import { GuildService } from "./guildService";
import { UserService } from "./userService";
import { VerifyService } from "./verifyService";

export class ServiceManager {
  static guild: GuildService;
  static user: UserService;
  static verify: VerifyService;

  static initialized = false;

  static init(prisma: PrismaClient) {
    if (ServiceManager.initialized) {
      Logger.warn("ServiceManager should only be initialized once");
      return;
    }

    ServiceManager.guild = new GuildService(prisma);
    ServiceManager.user = new UserService(prisma);
    ServiceManager.verify = new VerifyService(prisma);

    ServiceManager.initialized = true;
  }
}
