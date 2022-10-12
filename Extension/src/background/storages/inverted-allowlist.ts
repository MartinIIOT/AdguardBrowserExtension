import { SettingOption } from '../schema';
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';

export const invertedAllowlistDomainsStorage = new StringStorage<
    SettingOption.InvertedAllowlistDomains,
    string[],
    'sync'
>(
    SettingOption.InvertedAllowlistDomains,
    settingsStorage,
);
