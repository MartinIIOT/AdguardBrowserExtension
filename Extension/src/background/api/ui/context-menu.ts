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
                    ContextMenuApi.addMenuItem(ContextMenuAction.SITE_EXCEPTION);
                } else if (canAddRemoveRule) {
                    if (documentAllowlisted) {
                        ContextMenuApi.addMenuItem(ContextMenuAction.SITE_FILTERING_ON);
                    } else {
                        ContextMenuApi.addMenuItem(ContextMenuAction.SITE_FILTERING_OFF);
                    }
                }
                ContextMenuApi.addSeparator();

                if (!documentAllowlisted) {
                    ContextMenuApi.addMenuItem(ContextMenuAction.BLOCK_SITE_ADS);
                }

                ContextMenuApi.addMenuItem(ContextMenuAction.SECURITY_REPORT);
                ContextMenuApi.addMenuItem(ContextMenuAction.COMPLAINT_WEBSITE);
                ContextMenuApi.addSeparator();
                ContextMenuApi.addMenuItem(ContextMenuAction.UPDATE_ANTIBANNER_FILTERS);
                ContextMenuApi.addSeparator();
                ContextMenuApi.addMenuItem(ContextMenuAction.OPEN_SETTINGS);
                ContextMenuApi.addMenuItem(ContextMenuAction.OPEN_LOG);
                ContextMenuApi.addMenuItem(ContextMenuAction.DISABLE_PROTECTION);
            }
        } catch (e) {
            // do nothing
        }
    }

    private static addFilteringDisabledMenuItems(): void {
        ContextMenuApi.addMenuItem(ContextMenuAction.SITE_FILTERING_DISABLED);
        ContextMenuApi.addSeparator();
        ContextMenuApi.addMenuItem(ContextMenuAction.OPEN_LOG);
        ContextMenuApi.addMenuItem(ContextMenuAction.OPEN_SETTINGS);
        ContextMenuApi.addMenuItem(ContextMenuAction.ENABLE_PROTECTION);
    }

    private static addUrlFilteringDisabledContextMenuAction(): void {
        ContextMenuApi.addMenuItem(ContextMenuAction.SITE_FILTERING_DISABLED);
        ContextMenuApi.addSeparator();
        ContextMenuApi.addMenuItem(ContextMenuAction.OPEN_LOG);
        ContextMenuApi.addMenuItem(ContextMenuAction.OPEN_SETTINGS);
        ContextMenuApi.addMenuItem(ContextMenuAction.UPDATE_ANTIBANNER_FILTERS);
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
