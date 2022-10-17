import browser from 'webextension-polyfill';

import { BrowserUtils } from '../../utils/browser-utils';
import { log } from '../../../common/log';
import { UserAgent } from '../../../common/user-agent';
import { SettingOption } from '../../schema';
import { AntiBannerFiltersId, AntibannerGroupsId } from '../../../common/constants';
import {
    CommonFilterMetadata,
    metadataStorage,
    filterStateStorage,
    groupStateStorage,
    settingsStorage,
    FiltersStorage,
    filterVersionStorage,
} from '../../storages';
import { network } from '../network';
import { CustomFilterApi } from './custom';

/**
 * API for managing common filter data.
 *
 * This class provides methods for reading common filter metadata from {@link metadataStorage.data.filters},
 * installation and updating common filters data, stored in next storages:
 * - {@link filterStateStorage} - filters states
 * - {@link filterVersionStorage} - filters versions
 * - {@link FiltersStorage}  - filter rules
 */
export class CommonFilterApi {
    /**
     * Get common filter metadata
     *
     * @param filterId - filter id
     *
     * @returns common filter metadata
     */
    public static getFilterMetadata(filterId: number): CommonFilterMetadata | undefined {
        return metadataStorage.getFilter(filterId);
    }

    /**
     * Get common filters metadata
     *
     * @returns common filters metadata array
     */
    public static getFiltersMetadata(): CommonFilterMetadata[] {
        return metadataStorage.getFilters();
    }

    /**
     * Checks if filter is common
     *
     * @param filterId - filter id
     *
     * @returns true, if filter is common, else returns false
     */
    public static isCommonFilter(filterId: number): boolean {
        return !CustomFilterApi.isCustomFilter(filterId)
        && filterId !== AntiBannerFiltersId.UserFilterId
        && filterId !== AntiBannerFiltersId.AllowlistFilterId;
    }

    /**
     * Update common filter
     *
     * @param filterId - filter id
     *
     * @returns updated filter metadata or null, if update is not required
     */
    public static async updateFilter(filterId: number): Promise<CommonFilterMetadata | null> {
        log.info(`Update filter ${filterId}`);

        const filterMetadata = CommonFilterApi.getFilterMetadata(filterId);

        if (!filterMetadata) {
            log.error(`Can't find filter ${filterId} metadata`);
            return null;
        }

        if (!CommonFilterApi.isFilterNeedUpdate(filterMetadata)) {
            log.info(`Filter ${filterId} is already updated`);
            return null;
        }

        try {
            await CommonFilterApi.loadFilterRulesFromBackend(filterId, true);
            log.info(`Successfully update filter ${filterId}`);
            return filterMetadata;
        } catch (e) {
            log.error(e);
            return null;
        }
    }

    /**
     * Download filter rules from backend and update filter state and metadata
     *
     * @param filterId - filter id
     * @param remote - is filter rules loaded from backend
     */
    public static async loadFilterRulesFromBackend(filterId: number, remote: boolean): Promise<void> {
        const isOptimized = settingsStorage.get(SettingOption.UseOptimizedFilters);

        const rules = await network.downloadFilterRules(filterId, remote, isOptimized) as string[];

        await FiltersStorage.set(filterId, rules);

        const currentFilterState = filterStateStorage.get(filterId);

        filterStateStorage.set(filterId, {
            installed: true,
            loaded: true,
            enabled: !!currentFilterState?.enabled,
        });

        const {
            version,
            expires,
            timeUpdated,
        } = CommonFilterApi.getFilterMetadata(filterId) as CommonFilterMetadata;

        filterVersionStorage.set(filterId, {
            version,
            expires,
            lastUpdateTime: new Date(timeUpdated).getTime(),
            lastCheckTime: Date.now(),
        });
    }

    /**
     * Load and enable default common filters.
     *
     * Called on extension installation
     */
    public static async initDefaultFilters(): Promise<void> {
        groupStateStorage.enableGroups([
            1,
            AntibannerGroupsId.LanguageFiltersGroupId,
            AntibannerGroupsId.OtherFiltersGroupId,
            AntibannerGroupsId.CustomFilterGroupId,
        ]);

        const filterIds = [
            AntiBannerFiltersId.EnglishFilterId,
            AntiBannerFiltersId.SearchAndSelfPromoFilterId,
        ];

        if (UserAgent.isAndroid) {
            filterIds.push(AntiBannerFiltersId.MobileAdsFilterId);
        }

        filterIds.push(...CommonFilterApi.getLangSuitableFilters());

        await Promise.allSettled(filterIds.map(id => CommonFilterApi.loadFilterRulesFromBackend(id, false)));

        filterStateStorage.enableFilters(filterIds);
    }

    /**
     * Get language-specific filters by user locale
     *
     * @returns list of language-specific filters ids
     */
    public static getLangSuitableFilters(): number[] {
        let filterIds: number[] = [];

        let localeFilterIds = metadataStorage.getFilterIdsForLanguage(browser.i18n.getUILanguage());
        filterIds = filterIds.concat(localeFilterIds);

        // Get language-specific filters by navigator languages
        // Get all used languages
        const languages = BrowserUtils.getNavigatorLanguages();
        for (let i = 0; i < languages.length; i += 1) {
            localeFilterIds = metadataStorage.getFilterIdsForLanguage(languages[i]);
            filterIds = filterIds.concat(localeFilterIds);
        }

        return Array.from(new Set(filterIds));
    }

    /**
     * Checks if common filter need update.
     * Matches version from updated metadata with data in filter version storage.
     *
     * @param filterMetadata - updated filter metadata
     *
     * @returns true, if filter update is required, else returns false.
     */
    private static isFilterNeedUpdate(filterMetadata: CommonFilterMetadata): boolean {
        log.info(`Check if filter ${filterMetadata.filterId} need to update`);

        const filterVersion = filterVersionStorage.get(filterMetadata.filterId);

        if (!filterVersion) {
            return true;
        }

        return !BrowserUtils.isGreaterOrEqualsVersion(filterVersion.version, filterMetadata.version);
    }
}
