import zod from 'zod';

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

    // notifications
    LAST_NOTIFICATION_TIME = 'viewed-notification-time',
    VIEWED_NOTIFICATIONS = 'viewed-notifications',
}

export const settingsValidator = zod.object({
    [SettingOption.DISABLE_SHOW_ADGUARD_PROMO_INFO]: zod.boolean(),
    [SettingOption.DISABLE_SAFEBROWSING]: zod.boolean(),
    [SettingOption.DISABLE_COLLECT_HITS]: zod.boolean(),
    [SettingOption.DEFAULT_ALLOWLIST_MODE]: zod.boolean(),
    [SettingOption.ALLOWLIST_ENABLED]: zod.boolean(),
    [SettingOption.USE_OPTIMIZED_FILTERS]: zod.boolean(),
    [SettingOption.DISABLE_DETECT_FILTERS]: zod.boolean(),
    [SettingOption.DISABLE_SHOW_APP_UPDATED_NOTIFICATION]: zod.boolean(),
    [SettingOption.FILTERS_UPDATE_PERIOD]: zod.number(),
    [SettingOption.DISABLE_STEALTH_MODE]: zod.boolean(),
    [SettingOption.HIDE_REFERRER]: zod.boolean(),
    [SettingOption.HIDE_SEARCH_QUERIES]: zod.boolean(),
    [SettingOption.SEND_DO_NOT_TRACK]: zod.boolean(),
    [SettingOption.BLOCK_CHROME_CLIENT_DATA]: zod.boolean(),
    [SettingOption.BLOCK_WEBRTC]: zod.boolean(),
    [SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES]: zod.boolean(),
    [SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES_TIME]: zod.number(),
    [SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES]: zod.boolean(),
    [SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES_TIME]: zod.number(),
    [SettingOption.APPEARANCE_THEME]: zod.enum(['system', 'dark', 'light']),
    [SettingOption.USER_FILTER_ENABLED]: zod.boolean(),
    [SettingOption.HIDE_RATE_BLOCK]: zod.boolean(),
    [SettingOption.USER_RULES_EDITOR_WRAP]: zod.boolean(),
    [SettingOption.DISABLE_FILTERING]: zod.boolean(),
    [SettingOption.DISABLE_SHOW_PAGE_STATS]: zod.boolean(),
    [SettingOption.DISABLE_SHOW_CONTEXT_MENU]: zod.boolean(),
    [SettingOption.ALLOWLIST_DOMAINS]: zod.string(),
    [SettingOption.INVERTED_ALLOWLIST_DOMAINS]: zod.string(),

    [SettingOption.FILTERS_STATE]: zod.string().optional(),
    [SettingOption.FILTERS_VERSION]: zod.string().optional(),
    [SettingOption.GROUPS_STATE]: zod.string().optional(),

    [SettingOption.METADATA]: zod.string().optional(),
    [SettingOption.I18N_METADATA]: zod.string().optional(),

    [SettingOption.CUSTOM_FILTERS]: zod.string().optional(),

    [SettingOption.LAST_NOTIFICATION_TIME]: zod.number().optional(),
    [SettingOption.VIEWED_NOTIFICATIONS]: zod.array(zod.string()).optional(),
});

export type Settings = zod.infer<typeof settingsValidator>;
