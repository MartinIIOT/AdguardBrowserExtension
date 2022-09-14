/* eslint-disable no-console */
import browser from 'webextension-polyfill';
import { MessageType } from '../../../common/messages';
import { SettingOption, Settings } from '../../schema';
import { messageHandler } from '../../message-handler';
import { UserAgent } from '../../../common/user-agent';
import { AntiBannerFiltersId } from '../../../common/constants';

import { Engine } from '../../engine';
import { Categories, SettingsApi, TabsApi } from '../../api';
import { listeners } from '../../notifier';
import { SettingsEvents } from './events';
import { fullscreenUserRulesEditor } from '../fullscreen-user-rules-editor';

export class SettingsService {
    static onSettingChange = new SettingsEvents();

    static init() {
        messageHandler.addListener(MessageType.GET_OPTIONS_DATA, SettingsService.getOptionsData);
        messageHandler.addListener(MessageType.RESET_SETTINGS, SettingsService.reset);
        messageHandler.addListener(MessageType.CHANGE_USER_SETTING, SettingsService.changeUserSettings);
        messageHandler.addListener(MessageType.APPLY_SETTINGS_JSON, SettingsService.import);
        messageHandler.addListener(MessageType.LOAD_SETTINGS_JSON, SettingsService.export);

        SettingsService.onSettingChange.addListener(SettingOption.DISABLE_STEALTH_MODE, Engine.update);
        SettingsService.onSettingChange.addListener(SettingOption.HIDE_REFERRER, Engine.update);
        SettingsService.onSettingChange.addListener(SettingOption.HIDE_SEARCH_QUERIES, Engine.update);
        SettingsService.onSettingChange.addListener(SettingOption.SEND_DO_NOT_TRACK, Engine.update);
        SettingsService.onSettingChange.addListener(
            SettingOption.BLOCK_CHROME_CLIENT_DATA,
            Engine.update,
        );
        SettingsService.onSettingChange.addListener(SettingOption.BLOCK_WEBRTC, Engine.update);
        SettingsService.onSettingChange.addListener(
            SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES,
            Engine.update,
        );
        SettingsService.onSettingChange.addListener(
            SettingOption.SELF_DESTRUCT_THIRD_PARTY_COOKIES_TIME,
            Engine.update,
        );
        SettingsService.onSettingChange.addListener(
            SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES,
            Engine.update,
        );
        SettingsService.onSettingChange.addListener(
            SettingOption.SELF_DESTRUCT_FIRST_PARTY_COOKIES_TIME,
            Engine.update,
        );
        SettingsService.onSettingChange.addListener(
            SettingOption.DISABLE_FILTERING,
            SettingsService.onFilteringStateChange,
        );
    }

    static async setSettingAndPublishEvent<T extends SettingOption>(key: T, value: Settings[T]) {
        SettingsApi.setSetting(key, value);

        await SettingsService.onSettingChange.publishEvent(key, value);

        listeners.notifyListeners(listeners.SETTING_UPDATED, {
            propertyName: key,
            propertyValue: value,
        });
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
            filtersMetadata: Categories.getFiltersMetadata(),
            fullscreenUserRulesEditorIsOpen: fullscreenUserRulesEditor.isOpen(),
        };
    }

    static async changeUserSettings(message) {
        const { key, value } = message.data;
        await SettingsService.setSettingAndPublishEvent(key, value);
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

        listeners.notifyListeners(listeners.SETTINGS_UPDATED, isImported);
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
}
