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
import { SettingOption, Metadata } from '../schema';
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';

export type FilterVersionData = {
    version: string,
    lastCheckTime: number,
    lastUpdateTime: number,
    expires: number,
};

export type FilterVersionStorageData = Record<number, FilterVersionData>;

export class FilterVersionStorage extends StringStorage<
    SettingOption.FiltersVersion,
    FilterVersionStorageData,
    'sync'
> {
    public get(filterId: number): FilterVersionData {
        return this.data[filterId];
    }

    public set(filterId: number, data: FilterVersionData) {
        this.data[filterId] = data;

        this.save();
    }

    public delete(filterId: number) {
        delete this.data[filterId];

        this.save();
    }

    public refreshLastCheckTime(filtersIds: number[]) {
        const now = Date.now();

        for (let i = 0; i < filtersIds.length; i += 1) {
            const filterId = filtersIds[i];

            if (this.data[filterId]) {
                this.data[filterId].lastCheckTime = now;
            }
        }

        this.save();
    }

    public static applyMetadata(
        data: FilterVersionStorageData,
        metadata: Metadata,
    ) {
        const { filters } = metadata;

        for (let i = 0; i < filters.length; i += 1) {
            const {
                filterId,
                version,
                expires,
                timeUpdated,
            } = filters[i];

            if (!data[filterId]) {
                data[filterId] = {
                    version,
                    expires,
                    lastUpdateTime: new Date(timeUpdated).getTime(),
                    lastCheckTime: Date.now(),
                };
            }
        }

        return data;
    }
}

export const filterVersionStorage = new FilterVersionStorage(SettingOption.FiltersVersion, settingsStorage);
