import {
    metadataStorage,
    filterStateStorage,
    groupStateStorage,
    filterVersionStorage,
    GroupMetadata,
    GroupState,
    TagMetadata,
    CommonFilterMetadata,
    FilterState,
    FilterVersionData,
    CustomFilterMetadata,
} from '../../storages';
import { FiltersApi } from './main';

/**
 * Filter data displayed in category section on options page
 */
export type CategoriesFilterData = (
    CommonFilterMetadata | CustomFilterMetadata &
    FilterState &
    FilterVersionData &
    { tagsDetails: TagMetadata[] }
);

/**
 * Groups data displayed on options page
 */
export type CategoriesGroupData = (
    GroupMetadata &
    GroupState &
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
 * Helper class for aggregate filters and groups data for options page from next storages:
 * - {@link metadataStorage} - groups, tags and common filters metadata
 * - {@link customFilterMetadataStorage} - custom filter metadata
 * - {@link filterStateStorage} - filters states
 * - {@link filterVersionStorage} - filters versions
 * - {@link groupStateStorage} - groups states
 */
export class Categories {
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
