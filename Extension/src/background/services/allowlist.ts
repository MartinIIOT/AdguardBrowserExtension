import browser from 'webextension-polyfill';
import {
    MessageType,
    SaveAllowlistDomainsMessage,
    AddAllowlistDomainPopupMessage,
    RemoveAllowlistDomainMessage,
} from '../../common/constants';
import { messageHandler } from '../message-handler';
import { Engine } from '../engine';
import { SettingOption } from '../schema';
import { AllowlistApi } from '../api';
import { settingsEvents } from '../events';

/**
 * Service for processing events with a allowlist
 */
export class AllowlistService {
    /**
     * Initialize handlers
     */
    static async init() {
        messageHandler.addListener(MessageType.GET_ALLOWLIST_DOMAINS, AllowlistService.onGetAllowlistDomains);
        messageHandler.addListener(MessageType.SAVE_ALLOWLIST_DOMAINS, AllowlistService.handleDomainsSave);
        messageHandler.addListener(MessageType.ADD_ALLOWLIST_DOMAIN_POPUP, AllowlistService.onAddAllowlistDomain);
        messageHandler.addListener(MessageType.REMOVE_ALLOWLIST_DOMAIN, AllowlistService.onRemoveAllowlistDomain);

        settingsEvents.addListener(
            SettingOption.ALLOWLIST_ENABLED,
            AllowlistService.onEnableStateChange,
        );

        settingsEvents.addListener(
            SettingOption.DEFAULT_ALLOWLIST_MODE,
            AllowlistService.onAllowlistModeChange,
        );
    }

    /**
     * Gets domains depending on current allowlist mode
     */
    static onGetAllowlistDomains() {
        const domains = AllowlistApi.isInverted()
            ? AllowlistApi.getInvertedAllowlistDomains()
            : AllowlistApi.getAllowlistDomains();

        const content = domains.join('\n');

        return { content, appVersion: browser.runtime.getManifest().version };
    }

    static async onAddAllowlistDomain(message: AddAllowlistDomainPopupMessage) {
        const { tabId } = message.data;

        await AllowlistApi.addTabUrlToAllowlist(tabId);
    }

    static async onRemoveAllowlistDomain(message: RemoveAllowlistDomainMessage) {
        const { tabId } = message.data;

        await AllowlistApi.removeTabUrlFromAllowlist(tabId);
    }

    /**
     * Stores domains depending on current allowlist mode
     */
    static async handleDomainsSave(message: SaveAllowlistDomainsMessage) {
        const { value } = message.data;

        const domains = value.split(/[\r\n]+/);

        if (AllowlistApi.isInverted()) {
            AllowlistApi.setInvertedAllowlistDomains(domains);
        } else {
            AllowlistApi.setAllowlistDomains(domains);
        }

        await Engine.update();
    }

    /**
     * Triggers engine update on enabling
     */
    static async onEnableStateChange() {
        await Engine.update();
    }

    /**
     * Triggers engine update on mode switch
     */
    static async onAllowlistModeChange() {
        await Engine.update();
    }
}
