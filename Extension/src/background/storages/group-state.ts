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

export type GroupState = {
    enabled: boolean;
    toggled: boolean;
};

export type GroupStateStorageData = Record<number, GroupState>;

export class GroupStateStorage extends StringStorage<
    SettingOption.GroupsState,
    GroupStateStorageData,
    'sync'
> {
    private static defaultState = {
        enabled: false,
        toggled: false,
    };

    public get(groupId: number): GroupState {
        return this.data[groupId];
    }

    public set(groupId: number, state: GroupState) {
        this.data[groupId] = state;

        this.save();
    }

    public delete(groupId: number) {
        delete this.data[groupId];

        this.save();
    }

    public getEnabledGroups(): number[] {
        return Object
            .entries(this.data)
            .filter(([,state]) => state.enabled)
            .map(([id]) => Number(id));
    }

    public enableGroups(groupIds: number[], toggled = true) {
        for (let i = 0; i < groupIds.length; i += 1) {
            const groupId = groupIds[i];
            this.data[groupId] = {
                enabled: true,
                toggled,
            };
        }

        this.save();
    }

    public disableGroups(groupIds: number[], toggled = true) {
        for (let i = 0; i < groupIds.length; i += 1) {
            const groupId = groupIds[i];
            this.data[groupId] = {
                enabled: false,
                toggled,
            };
        }

        this.save();
    }

    public static applyMetadata(
        states: GroupStateStorageData,
        metadata: Metadata,
    ) {
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

export const groupStateStorage = new GroupStateStorage(SettingOption.GroupsState, settingsStorage);
