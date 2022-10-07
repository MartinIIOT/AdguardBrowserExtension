import {
    TabContext,
    isHttpRequest,
    getDomain,
    MAIN_FRAME_ID,
} from '@adguard/tswebextension';
import { AntiBannerFiltersId } from '../../../common/constants';
import { SettingOption } from '../../schema';
import { appStorage } from '../../storages';
import { PageStatsApi } from '../filters';
import { SettingsApi } from '../settings';

export type FrameRule = {
    filterId: number,
    ruleText: string,
};

export type FrameData = {
    url: string,
    domainName: string | null,
    applicationAvailable: boolean,
    applicationFilteringDisabled: boolean,
    urlFilteringDisabled: boolean,
    documentAllowlisted: boolean,
    userAllowlisted: boolean,
    canAddRemoveRule: boolean,
    frameRule: FrameRule,
    totalBlockedTab: number,
    totalBlocked: number,
};

/**
 * Helper class for retrieving main frame data from both tswebextension and app state
 */
export class FramesApi {
    public static getMainFrameData({
        info,
        frames,
        metadata,
    }: TabContext): FrameData {
        let { url } = info;
        const { blockedRequestCount, mainFrameRule } = metadata;

        const mainFrame = frames.get(MAIN_FRAME_ID);

        if (!url) {
            url = mainFrame?.url;
        }

        const domainName = url ? getDomain(url) : null;

        const urlFilteringDisabled = !url || !isHttpRequest(url);

        const applicationAvailable = appStorage.get('isInit') && !urlFilteringDisabled;

        let frameRule: FrameRule | undefined;
        let documentAllowlisted = false;
        let userAllowlisted = false;
        let canAddRemoveRule = false;

        const totalBlocked = PageStatsApi.getTotalBlocked();

        const totalBlockedTab = blockedRequestCount || 0;
        const applicationFilteringDisabled = SettingsApi.getSetting(SettingOption.DISABLE_FILTERING);

        if (applicationAvailable) {
            documentAllowlisted = !!mainFrameRule && mainFrameRule.isAllowlist();
            if (documentAllowlisted) {
                const rule = mainFrameRule;

                const filterId = rule.getFilterListId();

                userAllowlisted = filterId === AntiBannerFiltersId.USER_FILTER_ID
                       || filterId === AntiBannerFiltersId.ALLOWLIST_FILTER_ID;

                frameRule = {
                    filterId,
                    ruleText: rule.getText(),
                };
            }
            // It means site in exception
            canAddRemoveRule = !(documentAllowlisted && !userAllowlisted);
        }

        return {
            url,
            applicationAvailable,
            domainName,
            applicationFilteringDisabled,
            urlFilteringDisabled,
            documentAllowlisted,
            userAllowlisted,
            canAddRemoveRule,
            frameRule,
            totalBlockedTab,
            totalBlocked,
        };
    }
}
