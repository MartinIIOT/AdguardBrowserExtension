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

/**
 * Extension version (x.x.x)
 *
 * @param version
 */
export class Version {
    public data = {};

    constructor(version: string) {
        const parts = String(version || '').split('.');

        for (let i = 3; i >= 0; i -= 1) {
            this.data[i] = Version.parseVersionPart(parts[i]);
        }
    }

    public compare(version: Version): number {
        for (let i = 0; i < 4; i += 1) {
            if (this.data[i] > version.data[i]) {
                return 1;
            } if (this.data[i] < version.data[i]) {
                return -1;
            }
        }
        return 0;
    }

    private static parseVersionPart(part: string): number {
        if (Number.isNaN(part)) {
            return 0;
        }

        return Math.max(Number(part) - 0, 0);
    }
}
