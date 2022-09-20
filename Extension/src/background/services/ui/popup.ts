import {
    defaultFilteringLog,
    FilteringEventType,
    ApplyBasicRuleEvent,
    tabsApi,
} from '@adguard/tswebextension';

import { MessageType } from '../../../common/messages';
import { messageHandler } from '../../message-handler';
import { SettingOption } from '../../schema';
import { UserAgent } from '../../../common/user-agent';
import { settingsStorage } from '../../storages';
import {
    PageStatsApi,
    SettingsApi,
    notificationApi,
    UiApi,
} from '../../api';

import { FramesApi, FrameData } from '../../api/ui/frames';

export class PopupService {
    static init() {
        messageHandler.addListener(MessageType.GET_TAB_INFO_FOR_POPUP, PopupService.getTabInfoForPopup);
        messageHandler.addListener(
            MessageType.CHANGE_APPLICATION_FILTERING_DISABLED,
            PopupService.onChangeFilteringDisable,
        );

        defaultFilteringLog.addEventListener(FilteringEventType.APPLY_BASIC_RULE, PopupService.onBasicRuleApply);
    }

    static async getTabInfoForPopup({ data }) {
        const { tabId } = data;

        return {
            frameInfo: PopupService.getMainFrameInfo(tabId),
            stats: PageStatsApi.getStatisticsData(),
            settings: SettingsApi.getData(),
            options: {
                showStatsSupported: true,
                isFirefoxBrowser: UserAgent.isFirefox,
                showInfoAboutFullVersion: !settingsStorage.get(SettingOption.DISABLE_SHOW_ADGUARD_PROMO_INFO),
                isMacOs: UserAgent.isMacOs,
                isEdgeBrowser: UserAgent.isEdge || UserAgent.isEdgeChromium,
                notification: await notificationApi.getCurrentNotification(),
                isDisableShowAdguardPromoInfo: settingsStorage.get(SettingOption.DISABLE_SHOW_ADGUARD_PROMO_INFO),
                hasCustomRulesToReset: false, // TODO,
            },
        };
    }

    static async onBasicRuleApply({ data }: ApplyBasicRuleEvent) {
        const { rule, tabId } = data;

        const blockedCountIncrement = 1;

        PageStatsApi.updateStats(rule.getFilterListId(), blockedCountIncrement);
        PageStatsApi.incrementTotalBlocked(blockedCountIncrement);

        const tabContext = tabsApi.getTabContext(tabId);

        UiApi.debounceUpdateTabIconAndContextMenu(tabContext);
    }

    private static async onChangeFilteringDisable({ data }) {
        const { state: disabled } = data;

        await SettingsApi.setSetting(SettingOption.DISABLE_FILTERING, disabled);
    }

    /**
    * Gets main frame popup data
    */
    private static getMainFrameInfo(tabId: number): FrameData {
        const tabContext = tabsApi.getTabContext(tabId);

        return FramesApi.getMainFrameData(tabContext);
    }
}
