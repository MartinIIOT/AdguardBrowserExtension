import zod from 'zod';

// General settings configuration

export const enum GeneralSettingsOption {
    AppLanguage = 'app-language',
    AllowAcceptableAds = 'allow-acceptable-ads',
    ShowBlockedAdsCount = 'show-blocked-ads-count',
    AutodetectFilters = 'autodetect-filters',
    SafebrowsingEnabled = 'safebrowsing-enabled',
    FiltersUpdatePeriod = 'filters-update-period',
    AppearanceTheme = 'appearance-theme',
}

export const generalSettingsConfigValidator = zod.object({
    [GeneralSettingsOption.AppLanguage]: zod.string().optional(),
    [GeneralSettingsOption.AllowAcceptableAds]: zod.boolean(),
    [GeneralSettingsOption.ShowBlockedAdsCount]: zod.boolean(),
    [GeneralSettingsOption.AutodetectFilters]: zod.boolean(),
    [GeneralSettingsOption.SafebrowsingEnabled]: zod.boolean(),
    [GeneralSettingsOption.FiltersUpdatePeriod]: zod.number().int(),
    [GeneralSettingsOption.AppearanceTheme]: zod.enum(['system', 'dark', 'light']).optional(),
});

export type GeneralSettingsConfig = zod.infer<typeof generalSettingsConfigValidator>;
