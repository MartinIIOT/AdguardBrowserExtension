import { UserAgent } from './user-agent';
import { SettingOption, Settings } from '../background/schema';

export const enum AppearanceTheme {
    SYSTEM = 'system',
    DARK = 'dark',
    LIGHT = 'light',
}

export const DEFAULT_FILTERS_UPDATE_PERIOD = -1;

export const DEFAULT_FIRST_PARTY_COOKIES_SELF_DESTRUCT_MIN = 4320;

export const DEFAULT_THIRD_PARTY_COOKIES_SELF_DESTRUCT_MIN = 2880;

export const DEFAULT_ALLOWLIST = [];

export const DEFAULT_INVERTED_ALLOWLIST = [];

export const defaultSettings: Settings = {
    [SettingOption.DISABLE_SHOW_ADGUARD_PROMO_INFO]: (!UserAgent.isWindows && !UserAgent.isMacOs) || UserAgent.isEdge,
    [SettingOption.DISABLE_SAFEBROWSING]: true,
    [SettingOption.DISABLE_COLLECT_HITS]: true,
    [SettingOption.DEFAULT_ALLOWLIST_MODE]: true,
    [SettingOption.ALLOWLIST_ENABLED]: true,
    [SettingOption.USE_OPTIMIZED_FILTERS]: UserAgent.isAndroid,
    [SettingOption.DISABLE_DETECT_FILTERS]: false,
    [SettingOption.DISABLE_SHOW_APP_UPDATED_NOTIFICATION]: false,
    [SettingOption.FILTERS_UPDATE_PERIOD]: DEFAULT_FILTERS_UPDATE_PERIOD,
    [SettingOption.DISABLE_STEALTH_MODE]: true,
    [SettingOption.HIDE_REFERRER]: true,
    [SettingOption.HIDE_SEARCH_QUERIES]: true,
    [SettingOption.SEND_DO_NOT_TRACK]: true,
    [SettingOption.BLOCK_CHROME_CLIENT_DATA]: UserAgent.isChrome,
    [SettingOption.BLOCK_WEBRTC]: false,
    [SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES]: true,
    [SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES_TIME]: DEFAULT_THIRD_PARTY_COOKIES_SELF_DESTRUCT_MIN,
    [SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES]: false,
    [SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES_TIME]: DEFAULT_FIRST_PARTY_COOKIES_SELF_DESTRUCT_MIN,
    [SettingOption.APPEARANCE_THEME]: AppearanceTheme.SYSTEM,
    [SettingOption.USER_FILTER_ENABLED]: true,
    [SettingOption.HIDE_RATE_BLOCK]: false,
    [SettingOption.USER_RULES_EDITOR_WRAP]: false,
    [SettingOption.DISABLE_FILTERING]: false,
    [SettingOption.DISABLE_SHOW_PAGE_STATS]: false,
    [SettingOption.DISABLE_SHOW_CONTEXT_MENU]: false,
    [SettingOption.ALLOWLIST_DOMAINS]: JSON.stringify(DEFAULT_ALLOWLIST),
    [SettingOption.INVERTED_ALLOWLIST_DOMAINS]: JSON.stringify(DEFAULT_INVERTED_ALLOWLIST),
};
