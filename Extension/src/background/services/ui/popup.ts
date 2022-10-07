import { tabsApi as tsWebExtTabApi } from '@adguard/tswebextension';

import { MessageType } from '../../../common/messages';
import { messageHandler } from '../../message-handler';
import { SettingOption } from '../../schema';
import { UserAgent } from '../../../common/user-agent';
import { settingsStorage } from '../../storages';
import {
    PageStatsApi,
    SettingsApi,
    notificationApi,
} from '../../api';

import { FramesApi } from '../../api/ui/frames';

export class PopupService {
    static init(): void {
        messageHandler.addListener(MessageType.GET_TAB_INFO_FOR_POPUP, PopupService.getTabInfoForPopup);
        messageHandler.addListener(
            MessageType.CHANGE_APPLICATION_FILTERING_DISABLED,
            PopupService.onChangeFilteringDisable,
        );
    }

    static async getTabInfoForPopup({ data }) {
        const { tabId } = data;

        const tabContext = tsWebExtTabApi.getTabContext(tabId);

        if (tabContext) {
            return {
                frameInfo: FramesApi.getMainFrameData(tabContext),
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
    }

    private static async onChangeFilteringDisable({ data }): Promise<void> {
        const { state: disabled } = data;

        await SettingsApi.setSetting(SettingOption.DISABLE_FILTERING, disabled);
    }
}
