import {
    CommonFilterMetadata,
    CustomFilterMetadata,
    filterStateStorage,
    filterVersionStorage,
    settingsStorage,
} from '../../storages';
import { FilterMetadata, FiltersApi } from './main';
import { SettingOption } from '../../schema';
import { DEFAULT_FILTERS_UPDATE_PERIOD } from '../../../common/settings';
import { CustomFilterApi } from './custom';
import { CommonFilterApi } from './common';

/**
 * API for filter rules updates
 */
export class FilterUpdateApi {
    /**
     * Check enabled filters update
     *
     * Called when user manually run update
     */
    public static async updateEnabledFilters(): Promise<FilterMetadata[]> {
        const enabledFilters = FiltersApi.getEnabledFilters();

        const updatedFilters = await FilterUpdateApi.updateFilters(enabledFilters);

        filterStateStorage.enableFilters(enabledFilters);

        filterVersionStorage.refreshLastCheckTime(enabledFilters);

        return updatedFilters;
    }

    /**
     * Check installed filters update on initialization
     * by matching update period via filters version check and expires timestamps
     */
    public static async autoUpdateFilters(): Promise<void> {
        const updatePeriod = settingsStorage.get(SettingOption.FiltersUpdatePeriod);

        // auto update disabled
        if (updatePeriod === 0) {
            return;
        }

        const filtersVersions = filterVersionStorage.getData();

        const filtersStates = filterStateStorage.getData();

        const filterVersionEntries = Object.entries(filtersVersions);

        const installedFilterVersionEntries = filterVersionEntries
            .filter(([id]) => !!filtersStates?.[Number(id)]?.installed);

        const filtersIdsToUpdate = installedFilterVersionEntries
            .filter(([, { lastCheckTime, expires }]) => {
                if (updatePeriod === DEFAULT_FILTERS_UPDATE_PERIOD) {
                    return lastCheckTime + expires <= Date.now();
                }

                return lastCheckTime + updatePeriod <= Date.now();
            })
            .map(([id]) => Number(id));

        await FilterUpdateApi.updateFilters(filtersIdsToUpdate);

        const installedFiltersIds = installedFilterVersionEntries.map(([id]) => Number(id));

        filterVersionStorage.refreshLastCheckTime(installedFiltersIds);
    }

    /**
     * Update filters
     *
     * @param filtersIds - list of filters ids to update
     */
    public static async updateFilters(filtersIds: number[]): Promise<FilterMetadata[]> {
        /**
         * Reload common filters metadata from backend for correct
         * version matching on update check.
         */
        await FiltersApi.loadMetadata(true);

        const updatedFiltersMetadata: FilterMetadata[] = [];

        const updateTasks = filtersIds.map(async (filterId) => {
            let filterMetadata: CustomFilterMetadata | CommonFilterMetadata | null;

            if (CustomFilterApi.isCustomFilter(filterId)) {
                filterMetadata = await CustomFilterApi.updateFilter(filterId);
            } else {
                filterMetadata = await CommonFilterApi.updateFilter(filterId);
            }

            if (filterMetadata) {
                updatedFiltersMetadata.push(filterMetadata);
            }
        });

        await Promise.allSettled(updateTasks);

        return updatedFiltersMetadata;
    }
}
