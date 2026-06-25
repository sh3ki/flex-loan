import { Prisma } from '@prisma/client';
import { prisma } from '../../../shared/utils/prisma.client';

const SETTINGS_ID = 'singleton';

const defaultSettings = {
  id: SETTINGS_ID,
  businessName: 'MFLEX',
  tagline: 'Flexible and fast loans for you',
  heroTitle: 'Quick Personal Loan Access',
  heroSubtitle: 'Simple direct lending for everyday financial needs.',
  ctaText: 'Loan Now',
  loanMinimum: 1000,
  loanMaximum: 10000,
  dailyInterestRate: new Prisma.Decimal(1),
  contactEmail: 'mflexadmin@gmail.com',
  contactPhone: '+63 814 460 809',
  contactAddress: 'Main Business District, Metro City',
};

export class SettingsRepository {
  async getOrCreate() {
    return prisma.systemSetting.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: defaultSettings,
    });
  }

  async update(data: {
    businessName?: string;
    tagline?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    ctaText?: string;
    loanMinimum?: number;
    loanMaximum?: number;
    dailyInterestRate?: number;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
  }) {
    const updateData: any = { ...data };

    if (typeof data.dailyInterestRate === 'number') {
      updateData.dailyInterestRate = new Prisma.Decimal(data.dailyInterestRate);
    }

    return prisma.systemSetting.upsert({
      where: { id: SETTINGS_ID },
      update: updateData,
      create: {
        ...defaultSettings,
        ...updateData,
      },
    });
  }
}

export const settingsRepository = new SettingsRepository();
