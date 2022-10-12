import { RuleConverter, RuleSyntaxUtils } from '@adguard/tsurlfilter';

import { log } from '../../../common/log';
import { AntiBannerFiltersId } from '../../../common/constants';
import { SettingOption } from '../../schema';
import { listeners } from '../../notifier';
import {
    FiltersStorage,
    settingsStorage,
    editorStorage,
    ruleConversionStorage,
} from '../../storages';

/**
 * Api for managing user rules list
 */
export class UserRulesApi {
    /**
     * Parse data from user rules list
     * If it's undefined, sets empty user rules list
     */
    public static async init(): Promise<void> {
        const userRules = await FiltersStorage.get(AntiBannerFiltersId.UserFilterId);

        if (!userRules) {
            await FiltersStorage.set(AntiBannerFiltersId.UserFilterId, []);
        }
    }

    /**
     * Checks, if user list is enabled
     *
     * @returns true, if user list is enabled, else returns false
     */
    public static isEnabled(): boolean {
        return settingsStorage.get(SettingOption.UserFilterEnabled);
    }

    /**
     * Checks, if user list contains rules for specified url
     *
     * @param url - page url
     *
     * @returns true, if user list contains rules for {@link url}, else returns false
     */
    public static async hasRulesForUrl(url: string): Promise<boolean> {
        const userRules = await UserRulesApi.getUserRules();
        return userRules.some(userRuleString => RuleSyntaxUtils.isRuleForUrl(
            userRuleString,
            url,
        ));
    }

    /**
     * Get rules from user list
     */
    public static async getUserRules(): Promise<string[]> {
        return FiltersStorage.get(AntiBannerFiltersId.UserFilterId);
    }

    /**
     * Add rule to user list
     *
     * @param rule - rule text
     */
    public static async addUserRule(rule: string): Promise<void> {
        const userRules = await UserRulesApi.getUserRules();

        userRules.push(rule);

        await UserRulesApi.setUserRules(userRules);
    }

    /**
     * Remove rule from user list
     *
     * @param rule - rule text
     */
    public static async removeUserRule(rule: string): Promise<void> {
        const userRules = await UserRulesApi.getUserRules();

        await UserRulesApi.setUserRules(userRules.filter(r => r !== rule));
    }

    /**
     * Remove rules for specified url from user list
     *
     * @param url - page url
     */
    public static async removeRulesByUrl(url: string): Promise<void> {
        const userRules = await UserRulesApi.getUserRules();

        await UserRulesApi.setUserRules(userRules.filter(rule => !RuleSyntaxUtils.isRuleForUrl(rule, url)));
    }

    /**
     * Set user rule list to storage
     *
     * @param rules - list of rule strings
     */
    public static async setUserRules(rules: string[]): Promise<void> {
        await FiltersStorage.set(AntiBannerFiltersId.UserFilterId, rules);

        listeners.notifyListeners(listeners.userFilterUpdated);
    }

    /**
     * Get persisted rules during switches between common and fullscreen modes
     *
     * @returns - user rules editor content
     */
    public static getEditorStorageData(): string | undefined {
        return editorStorage.get();
    }

    /**
     * Set persisted rules during switches between common and fullscreen modes
     *
     * @param data - user rules editor content
     */
    public static setEditorStorageData(data: string): void {
        editorStorage.set(data);
    }

    /**
     * Converts rules text lines with conversion map
     *
     * @param rules - list of rule strings
     *
     * @returns list of converted rule strings
     */
    public static convertRules(rules: string[]): string[] {
        ruleConversionStorage.clear();

        const result: string[] = [];
        for (let i = 0; i < rules.length; i += 1) {
            const line = rules[i];
            let converted: string[] = [];
            try {
                converted = RuleConverter.convertRule(line);
            } catch (e) {
                log.info(`Error converting rule ${line}, due to: ${e.message}`);
            }
            result.push(...converted);

            if (converted.length > 0) {
                if (converted.length > 1 || converted[0] !== line) {
                    // Fill the map only for converted rules
                    converted.forEach((x) => {
                        ruleConversionStorage.set(x, line);
                    });
                }
            }
        }

        log.debug('Converted {0} rules to {1} for user filter', rules.length, result.length);

        return result;
    }

    /**
     * Returns source rule text if the rule has been converted
     *
     * @param rule - converted rule text
     * @returns source rule text, if exist, else undefined
     */
    public static getSourceRule(rule: string): string | undefined {
        return ruleConversionStorage.get(rule);
    }
}
