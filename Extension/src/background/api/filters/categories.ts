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
import { UserAgent } from '../../../common/user-agent';
import {
    metadataStorage,
    filterStateStorage,
    groupStateStorage,
    filterVersionStorage,
} from '../../storages';
import { CommonFilterApi } from './common';
import { FilterMetadata, FiltersApi } from './main';
import {
    GroupMetadata,
    TagMetadata,
    RegularFilterMetadata,
    GroupStateData,
    FilterStateData,
    FilterVersionData,
    CustomFilterMetadata,
} from '../../schema';

/**
 * Filter data displayed in category section on options page
 */
export type CategoriesFilterData = (
    (RegularFilterMetadata | CustomFilterMetadata) &
    FilterStateData &
    FilterVersionData &
    { tagsDetails: TagMetadata[] }
);

/**
 * Groups data displayed on options page
 */
export type CategoriesGroupData = (
    GroupMetadata &
    GroupStateData &
    { filters?: CategoriesFilterData[] }
);

/**
 * Aggregated data for options page
 */
export type CategoriesData = {
    categories: CategoriesGroupData[],
    filters: CategoriesFilterData[]
};

/**
 * Class for filter groups management
 */
export class Categories {
    private static RECOMMENDED_TAG_ID = 10;

    private static PURPOSE_MOBILE_TAG_ID = 19;

    /**
     * Get aggregated filters category data for option page
     *
     * @returns categories aggregated data
     */
    public static getCategories(): CategoriesData {
        const groups = Categories.getGroups();
        const filters = Categories.getFilters();

        const categories: CategoriesGroupData[] = [];

        for (let i = 0; i < groups.length; i += 1) {
            const category = groups[i];
            category.filters = Categories.selectFiltersByGroupId(category.groupId, filters);
            categories.push(category);
        }

        return {
            filters,
            categories,
        };
    }

    /**
     * On first group enable enables recommended filters by groupId
     * On the next calls just enables group
     *
     * @param groupId - groupId
     */
    public static async enableGroup(groupId: number): Promise<void> {
        const group = groupStateStorage.get(groupId);

        if (!group.toggled) {
            const recommendedFiltersIds = Categories.getRecommendedFilterIdsByGroupId(groupId);
            await FiltersApi.loadAndEnableFilters(recommendedFiltersIds);
        }

        groupStateStorage.enableGroups([groupId]);
    }

    /**
     * Disable group
     *
     * @param groupId - group id
     */
    public static disableGroup(groupId: number): void {
        groupStateStorage.disableGroups([groupId]);
    }

    /**
     * Checks if filter has recommended tag
     *
     * @param filter - filter metadata
     *
     * @returns true, if filter has recommended tag, else returns false
     */
    private static isRecommendedFilter(filter: FilterMetadata): boolean {
        return filter.tags.includes(Categories.RECOMMENDED_TAG_ID);
    }

    /**
     * Checks if filter has mobile tag
     *
     * @param filter - filter metadata
     *
     * @returns true, if filter has mobile tag, else returns false
     */
    private static isMobileFilter(filter: FilterMetadata): boolean {
        return filter.tags.includes(Categories.PURPOSE_MOBILE_TAG_ID);
    }

    /**
     * If filter has mobile tag we check if platform is mobile, in other cases we do not check
     *
     * @param filter - filter metadata
     *
     * @returns true, if filter match platform, else returns false
     */
    private static isFilterMatchPlatform(filter: FilterMetadata): boolean {
        if (Categories.isMobileFilter(filter)) {
            return !!UserAgent.isAndroid;
        }
        return true;
    }

    /**
     * Returns recommended filters, which meet next requirements
     * 1. filter has recommended tag
     * 2. if filter has language tag, tag should match with user locale
     * 3. filter should correspond to platform mobile or desktop
     *
     * @param groupId - group id
     *
     * @returns recommended filters by groupId
     */
    private static getRecommendedFilterIdsByGroupId(groupId: number): number[] {
        const { categories } = Categories.getCategories();

        const langSuitableFilters = CommonFilterApi.getLangSuitableFilters();

        const group = categories.find(category => category.groupId === groupId);

        if (!group?.filters) {
            return [];
        }

        const { filters } = group;

        const result: number[] = [];

        filters.forEach(filter => {
            if (Categories.isRecommendedFilter(filter) && Categories.isFilterMatchPlatform(filter)) {
                // get ids intersection to enable recommended filters matching the lang tag
                // only if filter has language
                if (filter.languages && filter.languages.length > 0) {
                    if (langSuitableFilters.includes(filter.filterId)) {
                        result.push(filter.filterId);
                    }
                } else {
                    result.push(filter.filterId);
                }
            }
        });

        return result;
    }

    /**
     * Get tags metadata from {@link metadataStorage}
     *
     * @param tagsIds - tags ids
     *
     * @returns aggregated groups data
     */
    private static getTagsDetails(tagsIds: number[]): TagMetadata[] {
        const tagsMetadata = metadataStorage.getTags();

        const tagsDetails: TagMetadata[] = [];

        for (let i = 0; i < tagsIds.length; i += 1) {
            const tagId = tagsIds[i];

            const tagDetails = tagsMetadata.find(tag => tag.tagId === tagId);

            if (tagDetails) {
                if (tagDetails.keyword.startsWith('reference:')) {
                    // Hide 'reference:' tags
                    continue;
                }

                if (!tagDetails.keyword.startsWith('lang:')) {
                    // Hide prefixes except of 'lang:'
                    tagDetails.keyword = tagDetails.keyword.substring(tagDetails.keyword.indexOf(':') + 1);
                }

                tagsDetails.push(tagDetails);
            }
        }

        return tagsDetails;
    }

    /**
     * Get filters data from {@link metadataStorage},
     * {@link customFilterMetadataStorage}, {@link filterStateStorage} and
     * {@link filterVersionStorage}.
     *
     * @returns aggregated filters data
     */
    private static getFilters(): CategoriesFilterData[] {
        const filtersMetadata = FiltersApi.getFiltersMetadata();

        const result: CategoriesFilterData[] = [];

        for (let i = 0; i < filtersMetadata.length; i += 1) {
            const filterMetadata = filtersMetadata[i];

            const tagsIds = filterMetadata.tags;

            const tagsDetails = Categories.getTagsDetails(tagsIds);

            const filterState = filterStateStorage.get(filterMetadata.filterId);

            const filterVersion = filterVersionStorage.get(filterMetadata.filterId);

            result.push({
                ...filterMetadata,
                ...filterState,
                ...filterVersion,
                tagsDetails,
            });
        }

        return result;
    }

    /**
     * Get groups data from {@link metadataStorage} and {@link groupStateStorage}
     *
     * @returns aggregated groups data
     */
    private static getGroups(): CategoriesGroupData[] {
        const groupsMetadata = metadataStorage.getGroups();

        const result: CategoriesGroupData[] = [];

        for (let i = 0; i < groupsMetadata.length; i += 1) {
            const groupMetadata = groupsMetadata[i];

            const groupState = groupStateStorage.get(groupMetadata.groupId);

            result.push({
                ...groupMetadata,
                ...groupState,
            });
        }

        return result;
    }

    /**
     * Get filters data for specified group
     *
     * @param groupId - group id
     * @param filters - aggregated filters data
     * @returns aggregated filters data for specified group
     */
    private static selectFiltersByGroupId(groupId: number, filters: CategoriesFilterData[]): CategoriesFilterData[] {
        return filters.filter(filter => filter.groupId === groupId);
    }
}
