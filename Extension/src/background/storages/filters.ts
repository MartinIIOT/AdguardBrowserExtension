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
import { storage } from './main';

/**
 * Encapsulates interaction with stored filter rules
 */
export class FiltersStorage {
    static async set(filterId: number, filter: string[]): Promise<void> {
        const key = FiltersStorage.getFilterKey(filterId);

        await storage.set(key, filter);
    }

    static async get(filterId: number): Promise<string[]> {
        const key = FiltersStorage.getFilterKey(filterId);
        return storage.get(key) as Promise<string[]>;
    }

    static async remove(filterId: number) {
        const key = FiltersStorage.getFilterKey(filterId);
        return storage.remove(key);
    }

    private static getFilterKey(filterId: number): string {
        return `filterrules_${filterId}.txt`;
    }
}
