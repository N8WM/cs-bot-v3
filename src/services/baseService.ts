import { PrismaClient } from "@generated/prisma";

export abstract class BaseService {
  constructor(protected readonly prisma: PrismaClient) {}
}
