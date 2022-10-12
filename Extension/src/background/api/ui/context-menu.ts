import browser, { Menus } from 'webextension-polyfill';

import { translator } from '../../../common/translators/translator';
import { FrameData } from './frames';
import { ContextMenuAction, contextMenuEvents } from '../../events';

export type AddMenuItemOptions = Menus.CreateCreatePropertiesType & {
    messageArgs?: { [key: string]: unknown },
};

export class ContextMenuApi {
    public static async updateMenu({
        applicationFilteringDisabled,
        urlFilteringDisabled,
        documentAllowlisted,
        userAllowlisted,
        canAddRemoveRule,
    }: FrameData): Promise<void> {
        try {
            // clean up context menu
            await browser.contextMenus.removeAll();

            if (applicationFilteringDisabled) {
                ContextMenuApi.addFilteringDisabledMenuItems();
            } else if (urlFilteringDisabled) {
                ContextMenuApi.addUrlFilteringDisabledContextMenuAction();
            } else {
                if (documentAllowlisted && !userAllowlisted) {
                    ContextMenuApi.addMenuItem(ContextMenuAction.SiteException);
                } else if (canAddRemoveRule) {
                    if (documentAllowlisted) {
                        ContextMenuApi.addMenuItem(ContextMenuAction.SiteFilteringOn);
                    } else {
                        ContextMenuApi.addMenuItem(ContextMenuAction.SiteFilteringOff);
                    }
                }
                ContextMenuApi.addSeparator();

                if (!documentAllowlisted) {
                    ContextMenuApi.addMenuItem(ContextMenuAction.BlockSiteAds);
                }

                ContextMenuApi.addMenuItem(ContextMenuAction.SecurityReport);
                ContextMenuApi.addMenuItem(ContextMenuAction.ComplaintWebsite);
                ContextMenuApi.addSeparator();
                ContextMenuApi.addMenuItem(ContextMenuAction.UpdateAntibannerFilters);
                ContextMenuApi.addSeparator();
                ContextMenuApi.addMenuItem(ContextMenuAction.OpenSettings);
                ContextMenuApi.addMenuItem(ContextMenuAction.OpenLog);
                ContextMenuApi.addMenuItem(ContextMenuAction.DisableProtection);
            }
        } catch (e) {
            // do nothing
        }
    }

    private static addFilteringDisabledMenuItems(): void {
        ContextMenuApi.addMenuItem(ContextMenuAction.SiteFilteringDisabled);
        ContextMenuApi.addSeparator();
        ContextMenuApi.addMenuItem(ContextMenuAction.OpenLog);
        ContextMenuApi.addMenuItem(ContextMenuAction.OpenSettings);
        ContextMenuApi.addMenuItem(ContextMenuAction.EnableProtection);
    }

    private static addUrlFilteringDisabledContextMenuAction(): void {
        ContextMenuApi.addMenuItem(ContextMenuAction.SiteFilteringDisabled);
        ContextMenuApi.addSeparator();
        ContextMenuApi.addMenuItem(ContextMenuAction.OpenLog);
        ContextMenuApi.addMenuItem(ContextMenuAction.OpenSettings);
        ContextMenuApi.addMenuItem(ContextMenuAction.UpdateAntibannerFilters);
    }

    private static addMenuItem(action: ContextMenuAction, options: AddMenuItemOptions = {}): void {
        const { messageArgs, ...rest } = options;

        browser.contextMenus.create({
            contexts: ['all'],
            title: translator.getMessage(action, messageArgs),
            onclick: () => {
                contextMenuEvents.publishEvent(action);
            },
            ...rest,
        });
    }

    private static addSeparator(): void {
        browser.contextMenus.create({
            type: 'separator',
            contexts: ['all'],
        });
    }
}
