import browser from 'webextension-polyfill';
import { tabsApi } from '@adguard/tswebextension';

import { messageHandler } from '../../message-handler';
import {
    MessageType,
    OpenAbuseTabMessage,
    OpenSiteReportTabMessage,
} from '../../../common/messages';
import { UserAgent } from '../../../common/user-agent';
import { Engine } from '../../engine';
import { AntiBannerFiltersId } from '../../../common/constants';
import { listeners } from '../../notifier';

import {
    toasts,
    FiltersApi,
    TabsApi,
    SettingsApi,
    PagesApi,
    AssistantApi,
    UiApi,
} from '../../api';

export class UiService {
    public static async init() {
        await toasts.init();

        messageHandler.addListener(MessageType.OPEN_TAB, TabsApi.openTab);

        messageHandler.addListener(MessageType.OPEN_SETTINGS_TAB, PagesApi.openSettingsPage);
        messageHandler.addListener(MessageType.OPEN_FILTERING_LOG, PagesApi.openFilteringLogPage);
        messageHandler.addListener(MessageType.OPEN_ABUSE_TAB, UiService.openAbusePage);
        messageHandler.addListener(MessageType.OPEN_SITE_REPORT_TAB, UiService.openSiteReportPage);
        messageHandler.addListener(MessageType.OPEN_THANKYOU_PAGE, PagesApi.openThankYouPage);
        messageHandler.addListener(MessageType.OPEN_EXTENSION_STORE, PagesApi.openExtensionStorePage);
        messageHandler.addListener(MessageType.OPEN_COMPARE_PAGE, PagesApi.openComparePage);
        messageHandler.addListener(MessageType.OPEN_FULLSCREEN_USER_RULES, PagesApi.openFullscreenUserRulesPage);
        messageHandler.addListener(
            MessageType.ADD_FILTERING_SUBSCRIPTION,
            PagesApi.openSettingsPageWithCustomFilterModal,
        );

        messageHandler.addListener(MessageType.OPEN_ASSISTANT, AssistantApi.openAssistant);
        messageHandler.addListener(MessageType.INITIALIZE_FRAME_SCRIPT, UiService.initializeFrameScriptRequest);

        tabsApi.onUpdate.subscribe(UiApi.debounceUpdateTabIconAndContextMenu);
        tabsApi.onActivated.subscribe(UiApi.debounceUpdateTabIconAndContextMenu);
    }

    private static async openAbusePage({ data }: OpenAbuseTabMessage): Promise<void> {
        const { url, from } = data;

        await PagesApi.openAbusePage(url, from);
    }

    private static async openSiteReportPage({ data }: OpenSiteReportTabMessage): Promise<void> {
        const { url, from } = data;

        await PagesApi.openSiteReportPage(url, from);
    }

    private static initializeFrameScriptRequest() {
        const enabledFilters = {};
        Object.values(AntiBannerFiltersId).forEach((filterId) => {
            const enabled = FiltersApi.isFilterEnabled(Number(filterId));
            if (enabled) {
                enabledFilters[filterId] = true;
            }
        });

        return {
            userSettings: SettingsApi.getData(),
            enabledFilters,
            filtersMetadata: FiltersApi.getFiltersMetadata(),
            requestFilterInfo: {
                rulesCount: Engine.api.getRulesCount(),
            },
            environmentOptions: {
                isMacOs: UserAgent.isMacOs,
                canBlockWebRTC: true, // TODO
                isChrome: UserAgent.isChrome,
                Prefs: {
                    locale: browser.i18n.getUILanguage(),
                    mobile: UserAgent.isAndroid,
                },
                appVersion: browser.runtime.getManifest().version,
            },
            constants: {
                AntiBannerFiltersId,
                EventNotifierTypes: listeners.events,
            },
        };
    }
}
