import { SettingOption, I18nMetadata } from '../schema';
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';

export const i18nMetadataStorage = new StringStorage<SettingOption.I18nMetadata, I18nMetadata, 'sync'>(
    SettingOption.I18nMetadata,
    settingsStorage,
);
