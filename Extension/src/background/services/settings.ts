import browser from 'webextension-polyfill';
import { MessageType } from '../../common/messages';
import { SettingOption } from '../schema';
import { messageHandler } from '../message-handler';
import { UserAgent } from '../../common/user-agent';
import { AntiBannerFiltersId } from '../../common/constants';

import { Engine } from '../engine';
import { Categories, SettingsApi, TabsApi } from '../api';
import { listeners } from '../notifier';
import { ContextMenuAction, contextMenuEvents, settingsEvents } from '../events';
import { fullscreenUserRulesEditor } from './fullscreen-user-rules-editor';

export class SettingsService {
    static init() {
        messageHandler.addListener(MessageType.GetOptionsData, SettingsService.getOptionsData);
        messageHandler.addListener(MessageType.ResetSettings, SettingsService.reset);
        messageHandler.addListener(MessageType.ChangeUserSettings, SettingsService.changeUserSettings);
        messageHandler.addListener(MessageType.ApplySettingsJson, SettingsService.import);
        messageHandler.addListener(MessageType.LoadSettingsJson, SettingsService.export);

        settingsEvents.addListener(SettingOption.DisableStealthMode, Engine.update);
        settingsEvents.addListener(SettingOption.HideReferrer, Engine.update);
        settingsEvents.addListener(SettingOption.HideSearchQueries, Engine.update);
        settingsEvents.addListener(SettingOption.SendDoNotTrack, Engine.update);
        settingsEvents.addListener(
            SettingOption.BlockChromeClientData,
            Engine.update,
        );
        settingsEvents.addListener(SettingOption.BlockWebRTC, Engine.update);
        settingsEvents.addListener(
            SettingOption.SelfDestructThirdPartyCookies,
            Engine.update,
        );
        settingsEvents.addListener(
            SettingOption.SelfDestructThirdPartyCookiesTime,
            Engine.update,
        );
        settingsEvents.addListener(
            SettingOption.SelfDestructFirstPartyCookies,
            Engine.update,
        );
        settingsEvents.addListener(
            SettingOption.SelfDestructFirstPartyCookiesTime,
            Engine.update,
        );
        settingsEvents.addListener(
            SettingOption.DisableFiltering,
            SettingsService.onFilteringStateChange,
        );

        contextMenuEvents.addListener(
            ContextMenuAction.EnableProtection,
            SettingsService.enableFiltering,
        );

        contextMenuEvents.addListener(
            ContextMenuAction.DisableProtection,
            SettingsService.disableFiltering,
        );
    }

    static getOptionsData() {
        return {
            settings: SettingsApi.getData(),
            appVersion: browser.runtime.getManifest().version,
            environmentOptions: {
                isChrome: UserAgent.isChrome,
            },
            constants: {
                AntiBannerFiltersId,
            },
            filtersInfo: {
                rulesCount: Engine.api.getRulesCount(),
            },
            filtersMetadata: Categories.getCategories(),
            fullscreenUserRulesEditorIsOpen: fullscreenUserRulesEditor.isOpen(),
        };
    }

    static async changeUserSettings(message) {
        const { key, value } = message.data;
        await SettingsApi.setSetting(key, value);
    }

    static async reset() {
        try {
            await SettingsApi.reset();
            await Engine.update();
            return true;
        } catch (e) {
            return false;
        }
    }

    static async import(message) {
        const { json } = message.data;

        const isImported = await SettingsApi.import(json);

        await Engine.update();

        listeners.notifyListeners(listeners.SettingsUpdated, isImported);
        return isImported;
    }

    static async export() {
        return {
            content: await SettingsApi.export(),
            appVersion: browser.runtime.getManifest().version,
        };
    }

    static async onFilteringStateChange() {
        await Engine.update();

        const activeTab = await TabsApi.getActive();

        if (activeTab) {
            await browser.tabs.reload(activeTab.id);
        }
    }

    static async enableFiltering() {
        await SettingsApi.setSetting(SettingOption.DisableFiltering, false);
    }

    static async disableFiltering() {
        await SettingsApi.setSetting(SettingOption.DisableFiltering, true);
    }
}
