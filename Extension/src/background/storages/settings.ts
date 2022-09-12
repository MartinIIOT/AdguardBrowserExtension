import { debounce } from 'lodash';
import { ADGUARD_SETTINGS_KEY } from '../../common/constants';
import { StorageInterface } from '../../common/storage';
import { storage } from './main';
import { Settings, SettingOption } from '../schema';

/**
 * Storage for app settings
 */
export class SettingsStorage implements StorageInterface<SettingOption, Settings[SettingOption]> {
    static saveTimeoutMs = 100;

    /**
    * save settings in browser.storage.local
    */
    private save = debounce(() => {
        storage.set(ADGUARD_SETTINGS_KEY, this.settings);
    }, SettingsStorage.saveTimeoutMs);

    private settings: Settings;

    /**
     * Set setting to storage
     */
    public set<T extends SettingOption>(key: T, value: Settings[T]): void {
        this.settings[key] = value;
        this.save();
    }

    /**
     * Get setting from  storage
     */
    public get<T extends SettingOption>(key: T): Settings[T] {
        return this.settings[key];
    }

    /**
     * Remove setting from storage
     */
    public remove(key: SettingOption): void {
        if (this.settings[key]) {
            delete this.settings[key];
            this.save();
        }
    }

    /**
     * Get all current settings
     */
    public getData(): Settings {
        return this.settings;
    }

    /**
     * Set settings to memory cache
     */
    public setCache(settings: Settings) {
        this.settings = settings;
    }

    /**
     * Set settings to storage
     */
    public setData(settings: Settings) {
        this.setCache(settings);
        this.save();
    }
}

export const settingsStorage = new SettingsStorage();
