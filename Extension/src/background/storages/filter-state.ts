/**
 * @file
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adguard Browser Extension. If not, see <http://www.gnu.org/licenses/>.
 */
import { AntiBannerFiltersId } from '../../common/constants';
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';
import { SettingOption, Metadata } from '../schema';

export type FilterState = {
    enabled: boolean;
    installed: boolean;
    loaded: boolean;
};

export type FilterStateStorageData = Record<number, FilterState>;

export class FilterStateStorage extends StringStorage<
    SettingOption.FiltersState,
    FilterStateStorageData,
    'sync'
> {
    /**
     * This filters have own complex state management
     */
    private static unsupportedFiltersIds = [
        AntiBannerFiltersId.AllowlistFilterId,
        AntiBannerFiltersId.UserFilterId,
    ];

    private static defaultState = {
        enabled: false,
        installed: false,
        loaded: false,
    };

    public get(filterId: number): FilterState {
        return this.data[filterId];
    }

    public set(filterId: number, state: FilterState) {
        this.data[filterId] = state;

        this.save();
    }

    public setEnabled(filterId: number, enabled: boolean) {
        this.data[filterId].enabled = enabled;

        this.save();
    }

    public delete(filterId: number) {
        delete this.data[filterId];

        this.save();
    }

    public getEnabledFilters(): number[] {
        return Object
            .entries(this.data)
            .filter(([,state]) => state.enabled)
            .map(([id]) => Number(id));
    }

    public getInstalledFilters(): number[] {
        return Object
            .entries(this.data)
            .filter(([,state]) => state.installed)
            .map(([id]) => Number(id));
    }

    public enableFilters(filtersIds: number[]) {
        for (let i = 0; i < filtersIds.length; i += 1) {
            const filterId = filtersIds[i];
            this.data[filterId] = { ...this.data[filterId], enabled: true };
        }

        this.save();
    }

    public disableFilters(filtersIds: number[]) {
        for (let i = 0; i < filtersIds.length; i += 1) {
            const filterId = filtersIds[i];
            this.data[filterId] = { ...this.data[filterId], enabled: false };
        }

        this.save();
    }

    public static applyMetadata(
        states: FilterStateStorageData,
        metadata: Metadata,
    ) {
        const { filters } = metadata;
        /**
         * Don't create filter state context for allowlist and user rules lists
         * Their state is controlled by separate modules
         */
        const supportedFiltersMetadata = filters.filter(({ filterId }) => {
            return !FilterStateStorage.unsupportedFiltersIds.includes(filterId);
        });

        for (let i = 0; i < supportedFiltersMetadata.length; i += 1) {
            const { filterId } = supportedFiltersMetadata[i];

            if (!states[filterId]) {
                states[filterId] = { ...FilterStateStorage.defaultState };
            }
        }

        return states;
    }
}

export const filterStateStorage = new FilterStateStorage(SettingOption.FiltersState, settingsStorage);
