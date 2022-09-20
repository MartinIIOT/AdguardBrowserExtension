import browser from 'webextension-polyfill';

import { SettingOption } from '../../schema';
import { settingsStorage } from '../../storages';
import { getIconImageData } from '../extension';
import { FrameData } from './frames';
import { notificationApi } from './notification';

export class IconsApi {
    static async updateTabIcon(
        tabId: number,
        {
            urlFilteringDisabled,
            documentAllowlisted,
            applicationFilteringDisabled,
            totalBlockedTab,
        }: FrameData,
    ) {
        let icon: Record<string, string>;
        let badge: string;
        let badgeColor = '#555';

        const disabled = urlFilteringDisabled
            || documentAllowlisted
            || applicationFilteringDisabled;

        let blocked: number;

        if (!disabled && !settingsStorage.get(SettingOption.DISABLE_SHOW_PAGE_STATS)) {
            blocked = totalBlockedTab;
        } else {
            blocked = 0;
        }

        try {
            if (disabled) {
                icon = {
                    '19': browser.runtime.getURL('assets/icons/gray-19.png'),
                    '38': browser.runtime.getURL('assets/icons/gray-38.png'),
                };
            } else {
                icon = {
                    '19': browser.runtime.getURL('assets/icons/green-19.png'),
                    '38': browser.runtime.getURL('assets/icons/green-38.png'),
                };
            }

            if (blocked === 0) {
                badge = '';
            } else if (blocked > 99) {
                badge = '\u221E';
            } else {
                badge = String(blocked);
            }

            // If there's an active notification, indicate it on the badge
            const notification = await notificationApi.getCurrentNotification();
            if (notification) {
                badge = notification.badgeText || badge;
                badgeColor = notification.badgeBgColor || badgeColor;

                if (notification.icons) {
                    if (disabled) {
                        icon = notification.icons.ICON_GRAY;
                    } else {
                        icon = notification.icons.ICON_GREEN;
                    }
                }
            }

            await browser.browserAction.setIcon({ tabId, imageData: await getIconImageData(icon) });

            if (badge) {
                await browser.browserAction.setBadgeText({ tabId, text: badge });
                await browser.browserAction.setBadgeBackgroundColor({ tabId, color: badgeColor });
            }
        } catch (e) {
            // do nothing
        }
    }
}
