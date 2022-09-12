import { SettingOption } from '../schema';
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';

export const allowlistDomainsStorage = new StringStorage<SettingOption.ALLOWLIST_DOMAINS, string[], 'sync'>(
    SettingOption.ALLOWLIST_DOMAINS,
    settingsStorage,
);
