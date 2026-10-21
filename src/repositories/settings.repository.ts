import { PrismaClient } from '@prisma/client';

export class SettingsRepository {
  constructor(private prisma: PrismaClient) {}

  async getOrCreate() {
    let settings = await this.prisma.settings.findFirst();
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          shopName: null,
          language: 'en',
          defaultUnits: null,
          backupPreferences: null,
        },
      });
    }
    return settings;
  }

  async update(data: {
    shopName?: string | null;
    language?: string;
    defaultUnits?: string | null;
    backupPreferences?: string | null;
  }) {
    const settings = await this.getOrCreate();
    return this.prisma.settings.update({
      where: { id: settings.id },
      data,
    });
  }
}
