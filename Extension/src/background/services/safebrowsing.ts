import browser, { WebRequest } from 'webextension-polyfill';
import { RequestType } from '@adguard/tsurlfilter';
import { RequestData, RequestEvents } from '@adguard/tswebextension';
import { SafebrowsingApi, TabsApi } from '../api';
import { SettingOption } from '../schema';
import { settingsEvents } from '../events';
import { messageHandler } from '../message-handler';
import { MessageType } from '../../common/messages';

export class SafebrowsingService {
    public static async init() {
        await SafebrowsingApi.initCache();

        settingsEvents.addListener(
            SettingOption.DISABLE_SAFEBROWSING,
            SafebrowsingApi.clearCache,
        );

        RequestEvents.onHeadersReceived.addListener(SafebrowsingService.onHeaderReceived);

        messageHandler.addListener(MessageType.OPEN_SAFEBROWSING_TRUSTED, SafebrowsingService.onAddTrustedDomain);
    }

    private static onHeaderReceived({ context }: RequestData<WebRequest.OnHeadersReceivedDetailsType>) {
        const {
            requestType,
            statusCode,
            requestUrl,
            referrerUrl,
            tabId,
        } = context;

        if (requestType === RequestType.Document && statusCode !== 301 && statusCode !== 302) {
            SafebrowsingApi
                .checkSafebrowsingFilter(requestUrl, referrerUrl)
                .then((safebrowsingUrl) => {
                    browser.tabs.update(tabId, { url: safebrowsingUrl });
                })
                .catch(() => {});
        }
    }

    private static async onAddTrustedDomain({ data }): Promise<void> {
        const { url } = data;
        await SafebrowsingApi.addToSafebrowsingTrusted(url);

        const tab = await TabsApi.getActive();

        if (tab?.id) {
            await browser.tabs.update(tab.id, { url });
        }
    }
}
