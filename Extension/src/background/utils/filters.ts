import { AntiBannerFiltersId } from '../../common/constants';

/**
 * Util class for detect filter type. Includes various filter identifiers
 */
export const filters = (() => {
    const FilterUtils = {
        ids: AntiBannerFiltersId,

        isUserFilterRule(rule) {
            return rule.getFilterListId() === AntiBannerFiltersId.UserFilterId;
        },

        isAllowlistFilterRule(rule) {
            return rule.getFilterListId() === AntiBannerFiltersId.AllowlistFilterId;
        },
    };

    // Make accessible only constants without functions. They will be passed to content-page
    FilterUtils.ids = AntiBannerFiltersId;

    // Copy filter ids to api
    Object.keys(AntiBannerFiltersId).forEach(key => {
        FilterUtils[key] = AntiBannerFiltersId[key];
    });

    return FilterUtils;
})();
