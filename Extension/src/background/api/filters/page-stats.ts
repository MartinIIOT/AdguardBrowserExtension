/**
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
import { translator } from '../../../common/translators/translator';
import {
    metadataStorage,
    pageStatsStorage,
    PageStatsStorage,
} from '../../storages';

export class PageStatsApi {
    /**
     * Init page stats storage
     */
    public static async init(): Promise<void> {
        try {
            const storageData = await pageStatsStorage.read();
            if (typeof storageData === 'string') {
                // TODO: schema validation
                pageStatsStorage.setCache(JSON.parse(storageData));
            } else {
                pageStatsStorage.setData({});
            }
        } catch (e) {
            pageStatsStorage.setData({});
        }
    }

    /**
     * Get total count of blocked requests
     *
     * @returns total count of blocked requests
     */
    public static getTotalBlocked(): number {
        return pageStatsStorage.getTotalBlocked() || 0;
    }

    /**
     * Increment total count of blocked requests
     *
     * @param value - increment value
     */
    public static incrementTotalBlocked(value: number): void {
        const totalBlocked = PageStatsApi.getTotalBlocked();
        pageStatsStorage.setTotalBlocked(totalBlocked + value);
    }

    /**
     * Resets stats
     */
    public static async reset(): Promise<void> {
        await pageStatsStorage.setData({});
    }

    /**
     * Updates stats data
     *
     * We store last 24 hours, 30 days and all past months stats
     *
     * @param filterId - filter id
     * @param blocked - count of blocked requests
     */
    public static async updateStats(
        filterId: number,
        blocked: number,
    ): Promise<void> {
        const blockedGroup = metadataStorage.getGroupByFilterId(filterId);

        if (!blockedGroup) {
            return;
        }

        const { groupId } = blockedGroup;

        const stats = pageStatsStorage.getStatisticsData();

        if (stats) {
            const updated = PageStatsStorage.updateStatsData(groupId, blocked, stats);
            return pageStatsStorage.setStatisticsData(updated);
        }

        const created = PageStatsStorage.createStatsData(groupId, blocked);
        await pageStatsStorage.setStatisticsData(created);
    }

    /**
     * Returns statistics data object
     */
    public static getStatisticsData() {
        const stats = pageStatsStorage.getStatisticsData();

        return {
            today: stats.hours,
            lastWeek: stats.days.slice(-7),
            lastMonth: stats.days.slice(-30),
            lastYear: stats.months.slice(-12),
            overall: stats.months,
            blockedGroups: PageStatsApi.getGroups(),
        };
    }

    private static getGroups() {
        const groups = metadataStorage.getGroups();

        return [{
            groupId: PageStatsStorage.TOTAL_GROUP_ID,
            groupName: translator.getMessage('popup_statistics_total'),
        }, ...groups.sort((prevGroup, nextGroup) => {
            return prevGroup.displayNumber - nextGroup.displayNumber;
        })];
    }
}
