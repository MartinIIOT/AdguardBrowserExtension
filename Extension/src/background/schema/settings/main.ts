import zod from 'zod';
import { SchemaPreprocessor } from '../preprocessor';

export enum SettingOption {
    // filters states
    FILTERS_STATE = 'filters-state',
    FILTERS_VERSION = 'filters-version',
    GROUPS_STATE = 'groups-state',

    // filters metadata
    METADATA = 'filters-metadata',
    I18N_METADATA = 'filters-i18n-metadata',
    CUSTOM_FILTERS = 'custom_filters',

    // user settings
    DISABLE_DETECT_FILTERS = 'detect-filters-disabled',
    DISABLE_SHOW_PAGE_STATS = 'disable-show-page-statistic',

    // allowlist domains
    ALLOWLIST_DOMAINS = 'white-list-domains',
    INVERTED_ALLOWLIST_DOMAINS = 'block-list-domains',

    // flag used to show link to comparison of desktop and browser adblocker versions
    DISABLE_SHOW_ADGUARD_PROMO_INFO = 'show-info-about-adguard-disabled',

    DISABLE_SAFEBROWSING = 'safebrowsing-disabled',
    DISABLE_FILTERING = 'adguard-disabled',
    DISABLE_COLLECT_HITS = 'hits-count-disabled',
    DISABLE_SHOW_CONTEXT_MENU = 'context-menu-disabled',
    USE_OPTIMIZED_FILTERS = 'use-optimized-filters',
    DEFAULT_ALLOWLIST_MODE = 'default-whitelist-mode',
    ALLOWLIST_ENABLED = 'allowlist-enabled',
    DISABLE_SHOW_APP_UPDATED_NOTIFICATION = 'show-app-updated-disabled',
    FILTERS_UPDATE_PERIOD = 'filters-update-period',
    APPEARANCE_THEME = 'appearance-theme',

    // User filter
    USER_FILTER_ENABLED = 'user-filter-enabled',

    // stealth mode
    DISABLE_STEALTH_MODE = 'stealth-disable-stealth-mode',
    HIDE_REFERRER = 'stealth-hide-referrer',
    HIDE_SEARCH_QUERIES = 'stealth-hide-search-queries',
    SEND_DO_NOT_TRACK = 'stealth-send-do-not-track',
    BLOCK_CHROME_CLIENT_DATA = 'stealth-remove-x-client',
    BLOCK_WEBRTC = 'stealth-block-webrtc',
    SELF_DESTRUCT_THIRD_PARTY_COOKIES = 'stealth-block-third-party-cookies',
    SELF_DESTRUCT_THIRD_PARTY_COOKIES_TIME = 'stealth-block-third-party-cookies-time',
    SELF_DESTRUCT_FIRST_PARTY_COOKIES = 'stealth-block-first-party-cookies',
    SELF_DESTRUCT_FIRST_PARTY_COOKIES_TIME = 'stealth-block-first-party-cookies-time',

    // UI misc
    HIDE_RATE_BLOCK = 'hide-rate-block',
    USER_RULES_EDITOR_WRAP = 'user-rules-editor-wrap',
}

// Setting options may be stringified, use preprocessors for correct type casting
export const settingsValidator = zod.object({
    [SettingOption.DISABLE_SHOW_ADGUARD_PROMO_INFO]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DISABLE_SAFEBROWSING]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DISABLE_COLLECT_HITS]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DEFAULT_ALLOWLIST_MODE]: SchemaPreprocessor.booleanValidator,
    [SettingOption.ALLOWLIST_ENABLED]: SchemaPreprocessor.booleanValidator,
    [SettingOption.USE_OPTIMIZED_FILTERS]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DISABLE_DETECT_FILTERS]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DISABLE_SHOW_APP_UPDATED_NOTIFICATION]: SchemaPreprocessor.booleanValidator,
    [SettingOption.FILTERS_UPDATE_PERIOD]: SchemaPreprocessor.numberValidator,
    [SettingOption.DISABLE_STEALTH_MODE]: SchemaPreprocessor.booleanValidator,
    [SettingOption.HIDE_REFERRER]: SchemaPreprocessor.booleanValidator,
    [SettingOption.HIDE_SEARCH_QUERIES]: SchemaPreprocessor.booleanValidator,
    [SettingOption.SEND_DO_NOT_TRACK]: SchemaPreprocessor.booleanValidator,
    [SettingOption.BLOCK_CHROME_CLIENT_DATA]: SchemaPreprocessor.booleanValidator,
    [SettingOption.BLOCK_WEBRTC]: SchemaPreprocessor.booleanValidator,
    [SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES]: SchemaPreprocessor.booleanValidator,
    [SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES_TIME]: SchemaPreprocessor.numberValidator,
    [SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES]: SchemaPreprocessor.booleanValidator,
    [SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES_TIME]: SchemaPreprocessor.numberValidator,
    [SettingOption.APPEARANCE_THEME]: zod.enum(['system', 'dark', 'light']),
    [SettingOption.USER_FILTER_ENABLED]: SchemaPreprocessor.booleanValidator,
    [SettingOption.HIDE_RATE_BLOCK]: SchemaPreprocessor.booleanValidator,
    [SettingOption.USER_RULES_EDITOR_WRAP]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DISABLE_FILTERING]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DISABLE_SHOW_PAGE_STATS]: SchemaPreprocessor.booleanValidator,
    [SettingOption.DISABLE_SHOW_CONTEXT_MENU]: SchemaPreprocessor.booleanValidator,
    [SettingOption.ALLOWLIST_DOMAINS]: zod.string(),
    [SettingOption.INVERTED_ALLOWLIST_DOMAINS]: zod.string(),

    [SettingOption.FILTERS_STATE]: zod.string().optional(),
    [SettingOption.FILTERS_VERSION]: zod.string().optional(),
    [SettingOption.GROUPS_STATE]: zod.string().optional(),

    [SettingOption.METADATA]: zod.string().optional(),
    [SettingOption.I18N_METADATA]: zod.string().optional(),

    [SettingOption.CUSTOM_FILTERS]: zod.string().optional(),
});

export type Settings = zod.infer<typeof settingsValidator>;
