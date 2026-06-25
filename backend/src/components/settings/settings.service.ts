import { ApiError } from '../../shared/middleware/error.middleware';
import { appCache, cacheKeys } from '../../shared/utils/cache';
import { settingsRepository } from './data-access/settings.repository';

const SETTINGS_CACHE_TTL_MS = 30 * 60 * 1000;

export class SettingsService {
  async getPublicSettings() {
    const cacheKey = cacheKeys.systemSettingsPublic();
    const cached = appCache.get<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const settings = await settingsRepository.getOrCreate();
    const payload = {
      businessName: settings.businessName,
      tagline: settings.tagline,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      ctaText: settings.ctaText,
      loanMinimum: settings.loanMinimum,
      loanMaximum: settings.loanMaximum,
      dailyInterestRate: Number(settings.dailyInterestRate),
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactAddress: settings.contactAddress,
    };

    appCache.set(cacheKey, payload, SETTINGS_CACHE_TTL_MS);
    return payload;
  }

  async getAdminSettings() {
    const cacheKey = cacheKeys.systemSettingsAdmin();
    const cached = appCache.get<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const settings = await settingsRepository.getOrCreate();
    const payload = {
      businessName: settings.businessName,
      tagline: settings.tagline,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      ctaText: settings.ctaText,
      loanMinimum: settings.loanMinimum,
      loanMaximum: settings.loanMaximum,
      dailyInterestRate: Number(settings.dailyInterestRate),
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactAddress: settings.contactAddress,
      updatedAt: settings.updatedAt,
    };

    appCache.set(cacheKey, payload, SETTINGS_CACHE_TTL_MS);
    return payload;
  }

  async updateSettings(data: {
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
    if (
      typeof data.loanMinimum === 'number' &&
      typeof data.loanMaximum === 'number' &&
      data.loanMinimum > data.loanMaximum
    ) {
      throw new ApiError(400, 'Loan minimum cannot be greater than loan maximum');
    }

    if (typeof data.dailyInterestRate === 'number' && data.dailyInterestRate <= 0) {
      throw new ApiError(400, 'Daily interest rate must be greater than 0');
    }

    const updated = await settingsRepository.update(data);

    appCache.delete(cacheKeys.systemSettingsPublic());
    appCache.delete(cacheKeys.systemSettingsAdmin());

    return {
      businessName: updated.businessName,
      tagline: updated.tagline,
      heroTitle: updated.heroTitle,
      heroSubtitle: updated.heroSubtitle,
      ctaText: updated.ctaText,
      loanMinimum: updated.loanMinimum,
      loanMaximum: updated.loanMaximum,
      dailyInterestRate: Number(updated.dailyInterestRate),
      contactEmail: updated.contactEmail,
      contactPhone: updated.contactPhone,
      contactAddress: updated.contactAddress,
      updatedAt: updated.updatedAt,
    };
  }
}

export const settingsService = new SettingsService();
