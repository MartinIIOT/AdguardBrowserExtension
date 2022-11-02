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
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';
import { SettingOption } from '../schema';

export type CustomFilterMetadata = {
    filterId: number,
    displayNumber: number,
    groupId: number,
    name: string,
    description: string,
    homepage: string,
    tags: number[],
    customUrl: string,
    trusted: boolean,
    checksum: string | null,
    version: string,
    expires: number,
    timeUpdated: number,
    languages?: string[],
};

/**
 * Storage for custom filters metadata
 */
export class CustomFilterMetadataStorage extends StringStorage<
    SettingOption.CustomFilters,
    CustomFilterMetadata[],
    'sync'
> {
    /**
     * Get custom filter metadata by filter id
     */
    public getById(filterId: number): CustomFilterMetadata | undefined {
        return this.getData().find(f => f.filterId === filterId);
    }

    /**
     * Get custom filter metadata by filter subscription url
     */
    public getByUrl(url: string): CustomFilterMetadata {
        return this.getData().find(f => f.customUrl === url);
    }

    /**
     * Set custom filter metadata with filterId key
     */
    public set(filter: CustomFilterMetadata): void {
        const data = this.getData().filter(f => f.filterId !== filter.filterId);

        data.push(filter);

        this.setData(data);
    }

    /**
     * Remove custom filter metadata
     */
    public remove(filterId: number): void {
        const data = this.getData().filter(f => f.filterId !== filterId);
        this.setData(data);
    }
}

export const customFilterMetadataStorage = new CustomFilterMetadataStorage(
    SettingOption.CustomFilters,
    settingsStorage,
);
