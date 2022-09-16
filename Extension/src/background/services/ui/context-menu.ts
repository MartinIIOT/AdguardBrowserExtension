import { TabContext, tabsApi } from '@adguard/tswebextension';
import browser, { Menus } from 'webextension-polyfill';

import { ForwardFrom } from '../../../common/forward';
import { SettingOption } from '../../schema';
import { TabsApi } from '../../api/extension';
import { PagesApi } from '../../api/ui/pages';
import { FiltersService } from '../filters';
import { UiService } from './main';
import { AllowlistService } from '../allowlist';
import { translator } from '../../../common/translators/translator';
import { FrameData, FramesApi } from '../../api/ui/frames';
import { SettingsApi } from '../../api';

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

export class ContextMenuService {
    public static actionMap = {
        [ContextMenuItems.BLOCK_SITE_ADS]: UiService.openAssistant,
        [ContextMenuItems.BLOCK_SITE_ELEMENT]: UiService.openAssistant, // TODO
        [ContextMenuItems.SECURITY_REPORT]: ContextMenuService.openSiteReportPage,
        [ContextMenuItems.COMPLAINT_WEBSITE]: ContextMenuService.openAbusePage,
        [ContextMenuItems.SITE_FILTERING_ON]: ContextMenuService.enableSiteFiltering,
        [ContextMenuItems.SITE_FILTERING_OFF]: ContextMenuService.disableSiteFiltering,
        [ContextMenuItems.ENABLE_PROTECTION]: ContextMenuService.enableFiltering,
        [ContextMenuItems.DISABLE_PROTECTION]: ContextMenuService.disableFiltering,
        [ContextMenuItems.OPEN_SETTINGS]: PagesApi.openSettingsPage,
        [ContextMenuItems.OPEN_LOG]: PagesApi.openFilteringLogPage,
        [ContextMenuItems.UPDATE_ANTIBANNER_FILTERS]: FiltersService.checkFiltersUpdate,
    };

    public static init() {
        tabsApi.onUpdate.subscribe(ContextMenuService.updateMenu);
        tabsApi.onActivated.subscribe(ContextMenuService.updateMenu);
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

    private static addFilteringDisabledMenuItems() {
        ContextMenuService.addMenuItem(ContextMenuItems.SITE_FILTERING_DISABLED);
        ContextMenuService.addSeparator();
        ContextMenuService.addMenuItem(ContextMenuItems.OPEN_LOG);
        ContextMenuService.addMenuItem(ContextMenuItems.OPEN_SETTINGS);
        ContextMenuService.addMenuItem(ContextMenuItems.ENABLE_PROTECTION);
    }

    private static addUrlFilteringDisabledContextMenuItems() {
        ContextMenuService.addMenuItem(ContextMenuItems.SITE_FILTERING_DISABLED);
        ContextMenuService.addSeparator();
        ContextMenuService.addMenuItem(ContextMenuItems.OPEN_LOG);
        ContextMenuService.addMenuItem(ContextMenuItems.OPEN_SETTINGS);
        ContextMenuService.addMenuItem(ContextMenuItems.UPDATE_ANTIBANNER_FILTERS);
    }

    private static addMenuItem(item: ContextMenuItems, options: AddMenuItemOptions = {}) {
        const { messageArgs, ...rest } = options;

        let onClick: (() => void) | undefined;

        const action = ContextMenuService.actionMap?.[item];

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

    private static addMenu({
        applicationFilteringDisabled,
        urlFilteringDisabled,
        documentAllowlisted,
        userAllowlisted,
        canAddRemoveRule,
    }: FrameData) {
        if (applicationFilteringDisabled) {
            ContextMenuService.addFilteringDisabledMenuItems();
        } else if (urlFilteringDisabled) {
            ContextMenuService.addUrlFilteringDisabledContextMenuItems();
        } else {
            if (documentAllowlisted && !userAllowlisted) {
                ContextMenuService.addMenuItem(ContextMenuItems.SITE_EXCEPTION);
            } else if (canAddRemoveRule) {
                if (documentAllowlisted) {
                    ContextMenuService.addMenuItem(ContextMenuItems.SITE_FILTERING_ON);
                } else {
                    ContextMenuService.addMenuItem(ContextMenuItems.SITE_FILTERING_OFF);
                }
            }
            ContextMenuService.addSeparator();

            if (!documentAllowlisted) {
                ContextMenuService.addMenuItem(ContextMenuItems.BLOCK_SITE_ADS);
                ContextMenuService.addMenuItem(ContextMenuItems.BLOCK_SITE_ELEMENT, {
                    contexts: ['image', 'video', 'audio'],
                });
            }

            ContextMenuService.addMenuItem(ContextMenuItems.SECURITY_REPORT);
            ContextMenuService.addMenuItem(ContextMenuItems.COMPLAINT_WEBSITE);
            ContextMenuService.addSeparator();
            ContextMenuService.addMenuItem(ContextMenuItems.UPDATE_ANTIBANNER_FILTERS);
            ContextMenuService.addSeparator();
            ContextMenuService.addMenuItem(ContextMenuItems.OPEN_SETTINGS);
            ContextMenuService.addMenuItem(ContextMenuItems.OPEN_LOG);
            ContextMenuService.addMenuItem(ContextMenuItems.DISABLE_PROTECTION);
        }
    }

    private static async updateMenu(tabContext: TabContext) {
        const frameData = FramesApi.getMainFrameDataByTabContext(tabContext);

        await browser.contextMenus.removeAll();

        ContextMenuService.addMenu(frameData);
    }
}
