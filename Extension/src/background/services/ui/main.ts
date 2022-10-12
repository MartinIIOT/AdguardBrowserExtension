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

        messageHandler.addListener(MessageType.OpenTab, TabsApi.openTab);

        messageHandler.addListener(MessageType.OpenSettingsTab, PagesApi.openSettingsPage);
        contextMenuEvents.addListener(ContextMenuAction.OpenSettings, PagesApi.openSettingsPage);

        messageHandler.addListener(MessageType.OpenFilteringLog, PagesApi.openFilteringLogPage);
        contextMenuEvents.addListener(ContextMenuAction.OpenLog, PagesApi.openFilteringLogPage);

        messageHandler.addListener(MessageType.OpenAbuseTab, UiService.openAbusePage);
        contextMenuEvents.addListener(ContextMenuAction.ComplaintWebsite, UiService.openAbusePageFromPContextMenu);

        messageHandler.addListener(MessageType.OpenSiteReportTab, UiService.openSiteReportPage);
        contextMenuEvents.addListener(ContextMenuAction.SecurityReport, UiService.openSiteReportPageFromContextMenu);

        messageHandler.addListener(MessageType.OpenThankyouPage, PagesApi.openThankYouPage);
        messageHandler.addListener(MessageType.OpenExtensionStore, PagesApi.openExtensionStorePage);
        messageHandler.addListener(MessageType.OpenComparePage, PagesApi.openComparePage);
        messageHandler.addListener(MessageType.OpenFullscreenUserRules, PagesApi.openFullscreenUserRulesPage);
        messageHandler.addListener(
            MessageType.AddFilteringSubscription,
            PagesApi.openSettingsPageWithCustomFilterModal,
        );

        messageHandler.addListener(MessageType.OpenAssistant, AssistantApi.openAssistant);
        contextMenuEvents.addListener(ContextMenuAction.BlockSiteAds, AssistantApi.openAssistant);

        messageHandler.addListener(MessageType.InitializeFrameScript, UiService.initializeFrameScriptRequest);

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
            await PagesApi.openAbusePage(activeTab.url, ForwardFrom.ContextMenu);
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
            await PagesApi.openSiteReportPage(activeTab.url, ForwardFrom.ContextMenu);
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
                EventNotifierType: listeners.events,
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
