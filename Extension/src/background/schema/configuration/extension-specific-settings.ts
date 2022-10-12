import zod from 'zod';

// Extension specific settings configuration

export const enum ExtensionSpecificSettingsOption {
    UseOptimizedFilters = 'use-optimized-filters',
    CollectHitsCount = 'collect-hits-count',
    ShowContextMenu = 'show-context-menu',
    ShowInfoAboutAdguard = 'show-info-about-adguard',
    ShowAppUpdatedInfo = 'show-app-updated-info',
    HideRateAdguard = 'hide-rate-adguard',
    UserRulesEditorWrap = 'user-rules-editor-wrap',
}

export const extensionSpecificSettingsConfigValidator = zod.object({
    [ExtensionSpecificSettingsOption.UseOptimizedFilters]: zod.boolean(),
    [ExtensionSpecificSettingsOption.CollectHitsCount]: zod.boolean(),
    [ExtensionSpecificSettingsOption.ShowContextMenu]: zod.boolean(),
    [ExtensionSpecificSettingsOption.ShowInfoAboutAdguard]: zod.boolean(),
    [ExtensionSpecificSettingsOption.ShowAppUpdatedInfo]: zod.boolean(),
    [ExtensionSpecificSettingsOption.HideRateAdguard]: zod.boolean(),
    [ExtensionSpecificSettingsOption.UserRulesEditorWrap]: zod.boolean(),
});

export type ExtensionSpecificSettingsConfig = zod.infer<typeof extensionSpecificSettingsConfigValidator>;
