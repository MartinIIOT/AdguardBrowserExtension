import browser from 'webextension-polyfill';

import { MessageType } from '../../common/messages';
import { DocumentBlockApi, TabsApi } from '../api';
import { Engine } from '../engine';
import { messageHandler } from '../message-handler';

export class DocumentBlockService {
    public static async init(): Promise<void> {
        await DocumentBlockApi.init();

        messageHandler.addListener(MessageType.ADD_URL_TO_TRUSTED, DocumentBlockService.onAddUrlToTrusted);
    }

    private static async onAddUrlToTrusted({ data }): Promise<void> {
        const { url } = data;

        await DocumentBlockApi.setTrustedDomain(url);
        await Engine.update();

        const tab = await TabsApi.getActive();

        if (tab?.id) {
            browser.tabs.update(tab.id, { url });
        }
    }
}
