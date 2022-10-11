import browser from 'webextension-polyfill';

import {
    AddUserRuleMessage,
    MessageType,
    RemoveUserRuleMessage,
    ResetCustomRulesForPageMessage,
    SaveUserRulesMessage,
    SetEditorStorageContentMessage,
} from '../../common/constants';
import { messageHandler } from '../message-handler';
import { Engine } from '../engine';
import { SettingOption } from '../schema';
import { SettingsApi, SettingsData, UserRulesApi } from '../api';
import { settingsEvents } from '../events';
import { Prefs } from '../prefs';

export type GetUserRulesResponse = {
    content: string,
    appVersion: string,
};

export type GetUserRulesEditorDataResponse = {
    userRules: string,
    settings: SettingsData,
};

export class UserRulesService {
    public static async init(): Promise<void> {
        await UserRulesApi.init();

        messageHandler.addListener(MessageType.GET_USER_RULES, UserRulesService.getUserRules);
        messageHandler.addListener(MessageType.GET_USER_RULES_EDITOR_DATA, UserRulesService.getUserRulesEditorData);
        messageHandler.addListener(MessageType.SAVE_USER_RULES, UserRulesService.handleUserRulesSave);
        messageHandler.addListener(MessageType.ADD_USER_RULE, UserRulesService.handleUserRuleAdd);
        messageHandler.addListener(MessageType.REMOVE_USER_RULE, UserRulesService.handleUserRuleRemove);
        messageHandler.addListener(MessageType.GET_EDITOR_STORAGE_CONTENT, UserRulesService.getEditorStorageContent);
        messageHandler.addListener(MessageType.SET_EDITOR_STORAGE_CONTENT, UserRulesService.setEditorStorageContent);
        messageHandler.addListener(MessageType.RESET_CUSTOM_RULES_FOR_PAGE, UserRulesService.resetCustomRulesForPage);

        Engine.api.onAssistantCreateRule.subscribe(UserRulesService.addUserRule);

        settingsEvents.addListener(
            SettingOption.USER_FILTER_ENABLED,
            UserRulesService.handleEnableStateChange,
        );
    }

    private static async getUserRules(): Promise<GetUserRulesResponse> {
        const userRules = await UserRulesApi.getUserRules();

        const content = userRules.join('\n');

        return { content, appVersion: Prefs.version };
    }

    private static async getUserRulesEditorData(): Promise<GetUserRulesEditorDataResponse> {
        const userRules = await UserRulesApi.getUserRules();

        const content = userRules.join('\n');

        return {
            userRules: content,
            settings: SettingsApi.getData(),
        };
    }

    private static async addUserRule(rule: string): Promise<void> {
        await UserRulesApi.addUserRule(rule);
        await Engine.update();
    }

    private static async handleUserRulesSave(message: SaveUserRulesMessage): Promise<void> {
        const { value } = message.data;

        await UserRulesApi.setUserRules(value.split('\n'));
        await Engine.update();
    }

    private static async handleUserRuleAdd(message: AddUserRuleMessage): Promise<void> {
        const { ruleText } = message.data;

        await UserRulesApi.addUserRule(ruleText);
        await Engine.update();
    }

    private static async handleUserRuleRemove(message: RemoveUserRuleMessage): Promise<void> {
        const { ruleText } = message.data;

        await UserRulesApi.removeUserRule(ruleText);
        await Engine.update();
    }

    private static async handleEnableStateChange(): Promise<void> {
        await Engine.update();
    }

    private static async resetCustomRulesForPage(message: ResetCustomRulesForPageMessage): Promise<void> {
        const { url, tabId } = message.data;

        await UserRulesApi.removeRulesByUrl(url);
        await Engine.update();

        await browser.tabs.reload(tabId);
    }

    private static getEditorStorageContent(): string {
        return UserRulesApi.getEditorStorageData();
    }

    private static setEditorStorageContent(message: SetEditorStorageContentMessage): void {
        const { content } = message.data;

        UserRulesApi.setEditorStorageData(content);
    }
}
