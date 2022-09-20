import browser, { Menus } from 'webextension-polyfill';

import { ForwardFrom } from '../../../common/forward';
import { SettingOption } from '../../schema';
import { translator } from '../../../common/translators/translator';
import { AssistantApi } from './assistant';
import { PagesApi } from './pages';
import { AllowlistApi } from '../filters/allowlist';
import { FilterUpdateApi } from '../filters/update';
import { SettingsApi } from '../settings';
import { TabsApi } from '../extension';
import { FrameData } from './frames';
import { Engine } from '../../engine';
import { listeners } from '../../notifier';
import { toasts } from './toasts';

export type AddMenuItemOptions = Menus.CreateCreatePropertiesType & {
    messageArgs?: { [key: string]: unknown },
};

export const enum ContextMenuItems {
    SITE_PROTECTION_DISABLED = 'context_site_protection_disabled',
    SITE_FILTERING_DISABLED = 'context_site_filtering_disabled',
    SITE_EXCEPTION = 'context_site_exception',
    BLOCK_SITE_ADS = 'context_block_site_ads',
    BLOCK_SITE_ELEMENT = 'context_block_site_element',
    SECURITY_REPORT = 'context_security_report',
    COMPLAINT_WEBSITE = 'context_complaint_website',
    SITE_FILTERING_ON = 'context_site_filtering_on',
    SITE_FILTERING_OFF = 'context_site_filtering_off',
    ENABLE_PROTECTION = 'context_enable_protection',
    DISABLE_PROTECTION = 'context_disable_protection',
    OPEN_SETTINGS = 'context_open_settings',
    OPEN_LOG = 'context_open_log',
    UPDATE_ANTIBANNER_FILTERS = 'context_update_antibanner_filters',
}

export class ContextMenuApi {
    public static actionMap = {
        [ContextMenuItems.BLOCK_SITE_ADS]: AssistantApi.openAssistant,
        [ContextMenuItems.BLOCK_SITE_ELEMENT]: AssistantApi.openAssistant, // TODO
        [ContextMenuItems.SECURITY_REPORT]: ContextMenuApi.openSiteReportPage,
        [ContextMenuItems.COMPLAINT_WEBSITE]: ContextMenuApi.openAbusePage,
        [ContextMenuItems.SITE_FILTERING_ON]: ContextMenuApi.enableSiteFiltering,
        [ContextMenuItems.SITE_FILTERING_OFF]: ContextMenuApi.disableSiteFiltering,
        [ContextMenuItems.ENABLE_PROTECTION]: ContextMenuApi.enableFiltering,
        [ContextMenuItems.DISABLE_PROTECTION]: ContextMenuApi.disableFiltering,
        [ContextMenuItems.OPEN_SETTINGS]: PagesApi.openSettingsPage,
        [ContextMenuItems.OPEN_LOG]: PagesApi.openFilteringLogPage,
        [ContextMenuItems.UPDATE_ANTIBANNER_FILTERS]: ContextMenuApi.checkFiltersUpdate,
    };

    public static updateMenu({
        applicationFilteringDisabled,
        urlFilteringDisabled,
        documentAllowlisted,
        userAllowlisted,
        canAddRemoveRule,
    }: FrameData) {
        // clean up context menu
        browser.contextMenus.removeAll();

        if (applicationFilteringDisabled) {
            ContextMenuApi.addFilteringDisabledMenuItems();
        } else if (urlFilteringDisabled) {
            ContextMenuApi.addUrlFilteringDisabledContextMenuItems();
        } else {
            if (documentAllowlisted && !userAllowlisted) {
                ContextMenuApi.addMenuItem(ContextMenuItems.SITE_EXCEPTION);
            } else if (canAddRemoveRule) {
                if (documentAllowlisted) {
                    ContextMenuApi.addMenuItem(ContextMenuItems.SITE_FILTERING_ON);
                } else {
                    ContextMenuApi.addMenuItem(ContextMenuItems.SITE_FILTERING_OFF);
                }
            }
            ContextMenuApi.addSeparator();

            if (!documentAllowlisted) {
                ContextMenuApi.addMenuItem(ContextMenuItems.BLOCK_SITE_ADS);
                ContextMenuApi.addMenuItem(ContextMenuItems.BLOCK_SITE_ELEMENT, {
                    contexts: ['image', 'video', 'audio'],
                });
            }

            ContextMenuApi.addMenuItem(ContextMenuItems.SECURITY_REPORT);
            ContextMenuApi.addMenuItem(ContextMenuItems.COMPLAINT_WEBSITE);
            ContextMenuApi.addSeparator();
            ContextMenuApi.addMenuItem(ContextMenuItems.UPDATE_ANTIBANNER_FILTERS);
            ContextMenuApi.addSeparator();
            ContextMenuApi.addMenuItem(ContextMenuItems.OPEN_SETTINGS);
            ContextMenuApi.addMenuItem(ContextMenuItems.OPEN_LOG);
            ContextMenuApi.addMenuItem(ContextMenuItems.DISABLE_PROTECTION);
        }
    }

    private static async checkFiltersUpdate() {
        try {
            const updatedFilters = await FilterUpdateApi.updateEnabledFilters();

            await Engine.update();

            toasts.showFiltersUpdatedAlertMessage(true, updatedFilters);
            listeners.notifyListeners(listeners.FILTERS_UPDATE_CHECK_READY, updatedFilters);

            return updatedFilters;
        } catch (e) {
            toasts.showFiltersUpdatedAlertMessage(false);
            listeners.notifyListeners(listeners.FILTERS_UPDATE_CHECK_READY);
        }
    }

    private static async enableFiltering() {
        await SettingsApi.setSetting(SettingOption.DISABLE_FILTERING, false);
    }

    private static async disableFiltering() {
        await SettingsApi.setSetting(SettingOption.DISABLE_FILTERING, true);
    }

    private static async enableSiteFiltering() {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.id) {
            await AllowlistApi.removeTabUrlFromAllowlist(activeTab.id);
        }
    }

    private static async disableSiteFiltering() {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.id) {
            await AllowlistApi.addTabUrlToAllowlist(activeTab.id);
        }
    }

    private static async openAbusePage() {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.url) {
            PagesApi.openAbusePage(activeTab.url, ForwardFrom.CONTEXT_MENU);
        }
    }

    private static async openSiteReportPage() {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.url) {
            PagesApi.openSiteReportPage(activeTab.url, ForwardFrom.CONTEXT_MENU);
        }
    }

    private static addFilteringDisabledMenuItems() {
        ContextMenuApi.addMenuItem(ContextMenuItems.SITE_FILTERING_DISABLED);
        ContextMenuApi.addSeparator();
        ContextMenuApi.addMenuItem(ContextMenuItems.OPEN_LOG);
        ContextMenuApi.addMenuItem(ContextMenuItems.OPEN_SETTINGS);
        ContextMenuApi.addMenuItem(ContextMenuItems.ENABLE_PROTECTION);
    }

    private static addUrlFilteringDisabledContextMenuItems() {
        ContextMenuApi.addMenuItem(ContextMenuItems.SITE_FILTERING_DISABLED);
        ContextMenuApi.addSeparator();
        ContextMenuApi.addMenuItem(ContextMenuItems.OPEN_LOG);
        ContextMenuApi.addMenuItem(ContextMenuItems.OPEN_SETTINGS);
        ContextMenuApi.addMenuItem(ContextMenuItems.UPDATE_ANTIBANNER_FILTERS);
    }

    private static addMenuItem(item: ContextMenuItems, options: AddMenuItemOptions = {}) {
        const { messageArgs, ...rest } = options;

        let onClick: (() => void) | undefined;

        const action = ContextMenuApi.actionMap?.[item];

        if (action) {
            onClick = () => {
                action();
            };
        }

        browser.contextMenus.create({
            contexts: ['all'],
            title: translator.getMessage(item, messageArgs),
            onclick: onClick,
            ...rest,
        });
    }

    private static addSeparator() {
        browser.contextMenus.create({
            type: 'separator',
            contexts: ['all'],
        });
    }
}
