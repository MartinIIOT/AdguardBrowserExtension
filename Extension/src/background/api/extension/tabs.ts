import browser, { Tabs, Windows } from 'webextension-polyfill';
import { Prefs } from '../../prefs';

/**
 * Extended {@link Tabs.CreateCreatePropertiesType} for {@link TabsApi.openTab} method
 */
export type OpenTabProps = Tabs.CreateCreatePropertiesType & {
    // If tab with url is found, focus it instead create new one
    focusIfOpen?: boolean,
};

/**
 * Extended {@link Windows.CreateCreateDataType} for {@link TabsApi.openWindow} method
 */
export type OpenWindowProps = Windows.CreateCreateDataType & {
    // If window with url is found, focus it instead create new one
    focusIfOpen?: boolean,
};

/**
 * Helper class for browser.tabs API
 */
export class TabsApi {
    /**
     * Get first matched tab for passed {@link Tabs.QueryQueryInfoType}
     *
     * @param queryInfo - browser.tabs.query argument
     * @returns first matched tab or null
     */
    public static async findOne(queryInfo: Tabs.QueryQueryInfoType): Promise<Tabs.Tab | null> {
        const matchedTabs = await browser.tabs.query(queryInfo);

        if (matchedTabs.length > 0) {
            return matchedTabs[0];
        }

        return null;
    }

    /**
     * Activates an existing tab regardless of the browser window
     *
     * @param tab - {@link Tabs.Tab} data
     */
    public static async focus(tab: Tabs.Tab): Promise<void> {
        const { id, windowId } = tab;

        await browser.tabs.update(id, { active: true });
        await browser.windows.update(windowId, { focused: true });
    }

    /**
     * Get all opened tabs info
     *
     * @returns array of opened tabs
     */
    public static async getAll(): Promise<Tabs.Tab[]> {
        return browser.tabs.query({});
    }

    /**
     * Get active tab in current window
     *
     * @returns active tab info or null
     */
    public static async getActive(): Promise<Tabs.Tab | null> {
        return TabsApi.findOne({
            currentWindow: true,
            active: true,
        });
    }

    /**
     * Creates new tab with specified {@link OpenTabProps}
     *
     * If {@link OpenTabProps.focusIfOpen} is true,
     * try to focus on existed tab with {@link OpenTabProps.url} instead creating new one
     *
     * @param param  - Extended {@link Tabs.CreateCreatePropertiesType} record with `focusIfOpen` boolean flag
     * @param param.focusIfOpen - if true, try to focus existed tab with specified url instead creating new one
     * @param param.url - tab url
     */
    public static async openTab({ focusIfOpen, url, ...props }: OpenTabProps): Promise<void> {
        if (focusIfOpen) {
            const tab = await TabsApi.findOne({ url });

            if (tab && !tab.active) {
                await TabsApi.focus(tab);
                return;
            }
        }

        await browser.tabs.create({
            url,
            ...props,
        });
    }

    /**
     * Creates new window with specified {@link OpenWindowProps}
     *
     * If {@link OpenWindowProps.focusIfOpen} is true,
     * try to focus on existed tab with {@link OpenTabProps.url} in any window instead creating new one
     *
     * @param param  - Extended {@link Windows.CreateCreateDataType} record with `focusIfOpen` boolean flag
     * @param param.focusIfOpen - if true, try to focus existed tab
     * with specified url in any window instead creating new one
     * @param param.url - tab url
     */
    public static async openWindow({ focusIfOpen, url, ...props }: OpenWindowProps): Promise<void> {
        if (focusIfOpen) {
            const tab = await TabsApi.findOne({ url });

            if (tab && !tab.active) {
                await TabsApi.focus(tab);
                return;
            }
        }

        await browser.windows.create({
            url,
            ...props,
        });
    }

    /**
     * Check, if page in tab is extension page
     *
     * @param tab - {@link Tabs.Tab} data
     * @returns true if it is extension page, else returns false
     */
    public static isAdguardExtensionTab(tab: Tabs.Tab): boolean {
        const { url } = tab;

        if (!url) {
            return false;
        }

        try {
            const parsed = new URL(url);

            const { protocol, hostname } = parsed;

            return protocol.indexOf(Prefs.scheme) > -1 && hostname === Prefs.id;
        } catch (e) {
            return false;
        }
    }
}
