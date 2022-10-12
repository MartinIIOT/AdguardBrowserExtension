import { SettingOption } from '../schema';
import { StringStorage } from '../utils/string-storage';
import { Metadata } from './metadata';
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
