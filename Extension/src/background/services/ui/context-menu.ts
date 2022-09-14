import browser, { Menus } from 'webextension-polyfill';

import { ForwardFrom } from '../../../common/forward';
import { SettingOption } from '../../schema';
import { TabsApi } from '../../api/extension';
import { PagesApi } from '../../api/ui/pages';
import { SettingsService } from '../settings';
import { FiltersService } from '../filters';
import { UiService } from './main';
import { AllowlistService } from '../allowlist';
import { translator } from '../../../common/translators/translator';

export type AddMenuItemOptions = Menus.CreateCreatePropertiesType & {
    messageArgs: { [key: string]: unknown },
};

export const enum ContextMenuActions {
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

// TODO
export class ContextMenuService {
    public static actionMap = {
        [ContextMenuActions.BLOCK_SITE_ADS]: UiService.openAssistant,
        [ContextMenuActions.BLOCK_SITE_ELEMENT]: UiService.openAssistant, // TODO
        [ContextMenuActions.SECURITY_REPORT]: ContextMenuService.openSiteReportPage,
        [ContextMenuActions.COMPLAINT_WEBSITE]: ContextMenuService.openAbusePage,
        [ContextMenuActions.SITE_FILTERING_ON]: ContextMenuService.enableSiteFiltering,
        [ContextMenuActions.SITE_FILTERING_OFF]: ContextMenuService.disableSiteFiltering,
        [ContextMenuActions.ENABLE_PROTECTION]: ContextMenuService.enableFiltering,
        [ContextMenuActions.DISABLE_PROTECTION]: ContextMenuService.disableFiltering,
        [ContextMenuActions.OPEN_SETTINGS]: PagesApi.openSettingsPage,
        [ContextMenuActions.OPEN_LOG]: PagesApi.openFilteringLogPage,
        [ContextMenuActions.UPDATE_ANTIBANNER_FILTERS]: FiltersService.checkFiltersUpdate,
    };

    private static async enableFiltering() {
        await SettingsService.setSettingAndPublishEvent(SettingOption.DISABLE_FILTERING, false);
    }

    private static async disableFiltering() {
        await SettingsService.setSettingAndPublishEvent(SettingOption.DISABLE_FILTERING, true);
    }

    private static async enableSiteFiltering() {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.id) {
            await AllowlistService.removeTabUrlFromAllowlist(activeTab.id);
        }
    }

    private static async disableSiteFiltering() {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.id) {
            await AllowlistService.addTabUrlToAllowlist(activeTab.id);
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

    private static addMenuItem(action: ContextMenuActions, options: AddMenuItemOptions) {
        const { messageArgs, ...rest } = options;

        browser.contextMenus.create({
            contexts: ['all'],
            title: translator.getMessage(action, messageArgs),
            onclick: () => {
                const callback = ContextMenuService.actionMap[action];

                if (callback) {
                    callback();
                }
            },
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
