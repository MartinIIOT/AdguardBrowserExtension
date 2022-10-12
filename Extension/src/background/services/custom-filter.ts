import browser, { WebNavigation } from 'webextension-polyfill';
import { RequestType } from '@adguard/tsurlfilter';
import { tabsApi } from '@adguard/tswebextension';
import {
    MessageType,
    LoadCustomFilterInfoMessage,
    SubscribeToCustomFilterMessage,
    RemoveAntiBannerFilterMessage,
} from '../../common/messages';
import { BACKGROUND_TAB_ID } from '../../common/constants';
import { CustomFilterApi } from '../api';
import { messageHandler } from '../message-handler';
import { Engine } from '../engine';

/**
 * Service for processing events with custom filters
 */
export class CustomFilterService {
    /**
     * Init handlers
     */
    static async init() {
        messageHandler.addListener(MessageType.LoadCustomFilterInfo, CustomFilterService.onCustomFilterInfoLoad);
        messageHandler.addListener(
            MessageType.SubscribeToCustomFilter,
            CustomFilterService.onCustomFilterSubscription,
        );
        messageHandler.addListener(MessageType.RemoveAntibannerFilter, CustomFilterService.onCustomFilterRemove);

        browser.webNavigation.onCommitted.addListener(CustomFilterService.injectSubscriptionScript);
    }

    /**
     * Get custom filter info for modal window
     */
    static async onCustomFilterInfoLoad(message: LoadCustomFilterInfoMessage) {
        const { url, title } = message.data;

        return CustomFilterApi.getFilterInfo(url, title);
    }

    /**
     * Add new custom filter
     */
    static async onCustomFilterSubscription(message: SubscribeToCustomFilterMessage) {
        const { filter } = message.data;

        const { customUrl, name, trusted } = filter;

        const filterMetadata = await CustomFilterApi.createFilter({
            customUrl,
            title: name,
            trusted,
            enabled: true,
        });

        await Engine.update();

        return filterMetadata;
    }

    /**
     * Remove custom filter
     */
    static async onCustomFilterRemove(message: RemoveAntiBannerFilterMessage) {
        const { filterId } = message.data;

        await CustomFilterApi.removeFilter(filterId);
    }

    /**
     * Inject custom filter subscription content script to tab
     */
    static injectSubscriptionScript(details: WebNavigation.OnCommittedDetailsType) {
        const { tabId, frameId } = details;

        if (tabId === BACKGROUND_TAB_ID) {
            return;
        }

        const frame = tabsApi.getTabFrame(tabId, frameId);

        if (!frame?.requestContext) {
            return;
        }

        const { requestContext } = frame;

        const { requestType } = requestContext;

        if (requestType !== RequestType.Document && requestType !== RequestType.Subdocument) {
            return;
        }

        try {
            browser.tabs.executeScript(tabId, {
                file: '/content-script/subscribe.js',
                runAt: 'document_start',
                frameId,
            });
        } catch (e) {
            // do nothing
        }
    }
}
