import browser from 'webextension-polyfill';
import {
    ApplyBasicRuleEvent,
    defaultFilteringLog,
    FilteringEventType,
    tabsApi as tsWebExtTabApi,
} from '@adguard/tswebextension';

import { log } from '../../../common/log';
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
    PageStatsApi,
} from '../../api';
import { ContextMenuAction, contextMenuEvents } from '../../events';
import { ForwardFrom } from '../../../common/forward';

export class UiService {
    public static async init(): Promise<void> {
        await toasts.init();

        messageHandler.addListener(MessageType.OPEN_TAB, TabsApi.openTab);

        messageHandler.addListener(MessageType.OPEN_SETTINGS_TAB, PagesApi.openSettingsPage);
        contextMenuEvents.addListener(ContextMenuAction.OPEN_SETTINGS, PagesApi.openSettingsPage);

        messageHandler.addListener(MessageType.OPEN_FILTERING_LOG, PagesApi.openFilteringLogPage);
        contextMenuEvents.addListener(ContextMenuAction.OPEN_LOG, PagesApi.openFilteringLogPage);

        messageHandler.addListener(MessageType.OPEN_ABUSE_TAB, UiService.openAbusePage);
        contextMenuEvents.addListener(ContextMenuAction.COMPLAINT_WEBSITE, UiService.openAbusePageFromPContextMenu);

        messageHandler.addListener(MessageType.OPEN_SITE_REPORT_TAB, UiService.openSiteReportPage);
        contextMenuEvents.addListener(ContextMenuAction.SECURITY_REPORT, UiService.openSiteReportPageFromContextMenu);

        messageHandler.addListener(MessageType.OPEN_THANKYOU_PAGE, PagesApi.openThankYouPage);
        messageHandler.addListener(MessageType.OPEN_EXTENSION_STORE, PagesApi.openExtensionStorePage);
        messageHandler.addListener(MessageType.OPEN_COMPARE_PAGE, PagesApi.openComparePage);
        messageHandler.addListener(MessageType.OPEN_FULLSCREEN_USER_RULES, PagesApi.openFullscreenUserRulesPage);
        messageHandler.addListener(
            MessageType.ADD_FILTERING_SUBSCRIPTION,
            PagesApi.openSettingsPageWithCustomFilterModal,
        );

        messageHandler.addListener(MessageType.OPEN_ASSISTANT, AssistantApi.openAssistant);
        contextMenuEvents.addListener(ContextMenuAction.BLOCK_SITE_ADS, AssistantApi.openAssistant);

        messageHandler.addListener(MessageType.INITIALIZE_FRAME_SCRIPT, UiService.initializeFrameScriptRequest);

        tsWebExtTabApi.onUpdate.subscribe(UiApi.update);
        tsWebExtTabApi.onActivated.subscribe(UiApi.update);

        defaultFilteringLog.addEventListener(FilteringEventType.APPLY_BASIC_RULE, UiService.onBasicRuleApply);
    }

    private static async openAbusePage({ data }: OpenAbuseTabMessage): Promise<void> {
        const { url, from } = data;

        await PagesApi.openAbusePage(url, from);
    }

    private static async openAbusePageFromPContextMenu(): Promise<void> {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.url) {
            await PagesApi.openAbusePage(activeTab.url, ForwardFrom.CONTEXT_MENU);
        } else {
            log.warn('Can`t open abuse page for active tab');
        }
    }

    private static async openSiteReportPage({ data }: OpenSiteReportTabMessage): Promise<void> {
        const { url, from } = data;

        await PagesApi.openSiteReportPage(url, from);
    }

    private static async openSiteReportPageFromContextMenu(): Promise<void> {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.url) {
            await PagesApi.openSiteReportPage(activeTab.url, ForwardFrom.CONTEXT_MENU);
        } else {
            log.warn('Can`t open site report page for active tab');
        }
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

    private static async onBasicRuleApply({ data }: ApplyBasicRuleEvent): Promise<void> {
        const { rule, tabId } = data;

        const blockedCountIncrement = 1;

        await PageStatsApi.updateStats(rule.getFilterListId(), blockedCountIncrement);
        PageStatsApi.incrementTotalBlocked(blockedCountIncrement);

        const tabContext = tsWebExtTabApi.getTabContext(tabId);

        if (!tabContext) {
            return;
        }

        await UiApi.update(tabContext);
    }
}
