import { SettingOption } from '../schema';
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';

export const allowlistDomainsStorage = new StringStorage<SettingOption.AllowlistDomains, string[], 'sync'>(
    SettingOption.AllowlistDomains,
    settingsStorage,
);
