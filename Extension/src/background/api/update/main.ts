import { log } from '../../../common/log';
import {
    settingsStorage,
    storage,
    filterStateStorage,
    FiltersStorage,
    appStorage,
} from '../../storages';
import {
    ADGUARD_SETTINGS_KEY,
    APP_SCHEMA_VERSION,
    APP_VERSION_KEY,
    CLIENT_ID_KEY,
    PAGE_STATISTIC_KEY,
    SB_LRU_CACHE_KEY,
    SB_SUSPENDED_CACHE_KEY,
    SCHEMA_VERSION_KEY,
} from '../../../common/constants';

import { SettingOption, settingsValidator } from '../../schema';
import { SafebrowsingApi } from '../safebrowsing';
import { BrowserUtils, RunInfo } from '../../utils';
import { defaultSettings } from '../../../common/settings';
import { FiltersApi } from '../filters';
import { InstallApi } from '../install';
import { SettingsApi } from '../settings';

export class UpdateApi {
    /**
     * On every update remove if necessary obsolete filters
     * Called after Filter Api initialization
     */
    public static async removeObsoleteFilters() {
        const filtersStateInfo = filterStateStorage.getData();
        const allFiltersMetadata = FiltersApi.getFiltersMetadata();

        const installedFiltersIds = Object.keys(filtersStateInfo)
            .map(filterId => Number(filterId));

        const existingFiltersIds = installedFiltersIds.filter((filterId) => {
            return allFiltersMetadata.find(f => f.filterId === filterId);
        });

        const filtersIdsToRemove = installedFiltersIds.filter((id) => {
            return !existingFiltersIds.includes(id);
        });

        const removePromises = filtersIdsToRemove.map(async (filterId) => {
            filterStateStorage.delete(filterId);
            await FiltersStorage.remove(filterId);
            log.info(`Filter with id: ${filterId} removed from the storage`);
        });

        await Promise.all(removePromises);
    }

    public static async update(runInfo: RunInfo) {
        try {
            if (!runInfo.previousVersion) {
                throw new Error('Can`t update app, because previous version is not found');
            }

            if (BrowserUtils.isGreaterVersion('4.0.180', runInfo.previousVersion)) {
                UpdateApi.clearPromoDetails();
            }

            if (BrowserUtils.isGreaterVersion('4.2.0', runInfo.previousVersion)) {
                await UpdateApi.updateSettings(runInfo);
            }

            // On every update clear persisted caches
            UpdateApi.clearCache();
        } catch (e) {
            log.error(`Error while app updating: ${e.message}`);
            await SettingsApi.reset();
        }
    }

    /**
     * In the v4.0.171 we have littered window.localStorage with proms used in the promo notifications module, now we
     * are clearing them
     */
    private static clearPromoDetails() {
        window.localStorage.removeItem(SettingOption.VIEWED_NOTIFICATIONS);
        window.localStorage.removeItem(SettingOption.LAST_NOTIFICATION_TIME);
    }

    /**
     * In the v4.2.0 we refactoring storage data structure
     */
    private static async updateSettings({
        currentVersion,
    }: RunInfo) {
        // sets schema version
        await storage.set(SCHEMA_VERSION_KEY, APP_SCHEMA_VERSION);

        // get current settings
        const currentSettings = await storage.get(ADGUARD_SETTINGS_KEY);

        if (typeof currentSettings !== 'object'
        || Array.isArray(currentSettings)
        || !currentSettings) {
            throw new Error('Settings in not a object');
        }

        // delete app version from settings and add updated to root storage
        if (currentSettings?.[APP_VERSION_KEY]) {
            delete currentSettings[APP_VERSION_KEY];
            await storage.set(APP_VERSION_KEY, currentVersion);
        }

        // move client id from settings to root storage
        let clientId = currentSettings?.[CLIENT_ID_KEY];

        if (!clientId) {
            clientId = InstallApi.genClientId();
        }

        await storage.set(CLIENT_ID_KEY, clientId);
        appStorage.setClientId(clientId);

        await UpdateApi.moveStorageData(CLIENT_ID_KEY, currentSettings);

        // move page stats to root storage
        await UpdateApi.moveStorageData(PAGE_STATISTIC_KEY, currentSettings);

        // move safebrowsing from settings data to root storage
        await UpdateApi.moveStorageData(SB_SUSPENDED_CACHE_KEY, currentSettings);
        await UpdateApi.moveStorageData(SB_LRU_CACHE_KEY, currentSettings);

        // merge with default settings and validate
        const settings = settingsValidator.parse({ ...defaultSettings, ...currentSettings });

        settingsStorage.setData(settings);
    }

    /**
     * move data from settings to root storage
     */
    private static async moveStorageData(
        key: string,
        currentSettings: object,
    ) {
        const data = currentSettings?.[key];

        if (data) {
            delete currentSettings[key];
            await storage.set(key, data);
        }
    }

    private static clearCache() {
        SafebrowsingApi.clearCache();
    }
}
