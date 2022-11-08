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
import {
    SettingOption,
    Metadata,
    GroupStateData,
    GroupStateStorageData,
} from '../schema';
import { StringStorage } from '../utils/string-storage';
import { settingsStorage } from './settings';

/**
 * Class for synchronous control {@link GroupStateStorageData},
 * that is persisted as string in another key value storage
 *
 * @see {@link StringStorage}
 */
export class GroupStateStorage extends StringStorage<
    SettingOption.GroupsState,
    GroupStateStorageData,
    'sync'
> {
    // default group state
    private static defaultState = {
        enabled: false,
        toggled: false,
    };

    /**
     * Gets specified group state
     *
     * @param groupId - group id
     * @returns specified group state
     */
    public get(groupId: number): GroupStateData {
        return this.data[groupId];
    }

    /**
     * Sets specified group state
     *
     * @param groupId - group id
     * @param state - group state
     */
    public set(groupId: number, state: GroupStateData): void {
        this.data[groupId] = state;

        this.save();
    }

    /**
     * Delete specified group state
     *
     * @param groupId - group id
     */
    public delete(groupId: number): void {
        delete this.data[groupId];

        this.save();
    }

    /**
     * Gets list of enabled groups ids
     *
     * @returns list of enabled groups ids
     */
    public getEnabledGroups(): number[] {
        return Object
            .entries(this.data)
            .filter(([,state]) => state.enabled)
            .map(([id]) => Number(id));
    }

    /**
     * Enables specified groups
     *
     * @param groupIds - list of groups to enable
     * @param toggled - mark groups as toggled on enabling
     */
    public enableGroups(groupIds: number[], toggled = true): void {
        for (let i = 0; i < groupIds.length; i += 1) {
            const groupId = groupIds[i];
            this.data[groupId] = {
                enabled: true,
                toggled,
            };
        }

        this.save();
    }

    /**
     * Disables specified groups
     *
     * @param groupIds - list of groups to disable
     * @param toggled - mark groups as toggled on disabling
     */
    public disableGroups(groupIds: number[], toggled = true): void {
        for (let i = 0; i < groupIds.length; i += 1) {
            const groupId = groupIds[i];
            this.data[groupId] = {
                enabled: false,
                toggled,
            };
        }

        this.save();
    }

    /**
     * Sets {@link defaultState} for new groups, found in passed {@link Metadata}
     *
     * @param states - current {@link GroupStateStorageData}
     * @param metadata - app {@link Metadata}
     * @returns - updated {@link GroupStateStorageData}
     */
    public static applyMetadata(
        states: GroupStateStorageData,
        metadata: Metadata,
    ): GroupStateStorageData {
        const { groups } = metadata;

        for (let i = 0; i < groups.length; i += 1) {
            const { groupId } = groups[i];

            if (!states[groupId]) {
                states[groupId] = { ...GroupStateStorage.defaultState };
            }
        }

        return states;
    }
}

/**
 * {@link GroupStateStorage} instance, that stores
 * stringified {@link GroupStateStorageData} in {@link settingsStorage} under
 * {@link SettingOption.GroupsState} key
 */
export const groupStateStorage = new GroupStateStorage(SettingOption.GroupsState, settingsStorage);
