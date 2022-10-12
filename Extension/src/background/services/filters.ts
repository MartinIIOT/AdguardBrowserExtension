import {
    AddAndEnableFilterMessage,
    DisableAntiBannerFilterMessage,
    DisableFiltersGroupMessage,
    EnableFiltersGroupMessage,
    MessageType,
} from '../../common/messages';
import { SettingOption } from '../schema';

import { messageHandler } from '../message-handler';
import { Engine } from '../engine';
import {
    FilterMetadata,
    FiltersApi,
    FilterUpdateApi,
    toasts,
    Categories,
    PageStatsApi,
} from '../api';
import {
    ContextMenuAction,
    contextMenuEvents,
    settingsEvents,
} from '../events';
import { listeners } from '../notifier';

export class FiltersService {
    public static async init(): Promise<void> {
        // TODO: debounce message events
        messageHandler.addListener(MessageType.AddAndEnableFilter, FiltersService.onFilterEnable);
        messageHandler.addListener(MessageType.DisableAntibannerFilter, FiltersService.onFilterDisable);
        messageHandler.addListener(MessageType.EnableFiltersGroup, FiltersService.onGroupEnable);
        messageHandler.addListener(MessageType.DisableFiltersGroup, FiltersService.onGroupDisable);
        messageHandler.addListener(MessageType.CheckAntibannerFiltersUpdate, FiltersService.checkFiltersUpdate);
        messageHandler.addListener(MessageType.ResetBlockedAdsCount, FiltersService.resetBlockedAdsCount);
        contextMenuEvents.addListener(ContextMenuAction.UpdateAntibannerFilters, FiltersService.checkFiltersUpdate);

        settingsEvents.addListener(SettingOption.UseOptimizedFilters, FiltersService.onOptimizedFiltersSwitch);
    }

    private static async onFilterEnable(message: AddAndEnableFilterMessage): Promise<void> {
        const { filterId } = message.data;

        await FiltersApi.loadAndEnableFilters([filterId]);

        await Engine.update();
    }

    private static async onFilterDisable(message: DisableAntiBannerFilterMessage): Promise<void> {
        const { filterId } = message.data;

        FiltersApi.disableFilters([filterId]);

        await Engine.update();
    }

    private static async onGroupEnable(message: EnableFiltersGroupMessage): Promise<void> {
        const { groupId } = message.data;

        await Categories.enableGroup(groupId);
        await Engine.update();
    }

    private static async onGroupDisable(message: DisableFiltersGroupMessage): Promise<void> {
        const { groupId } = message.data;

        Categories.disableGroup(groupId);
        await Engine.update();
    }

    private static async checkFiltersUpdate(): Promise<FilterMetadata[]> {
        try {
            const updatedFilters = await FilterUpdateApi.updateEnabledFilters();

            await Engine.update();

            toasts.showFiltersUpdatedAlertMessage(true, updatedFilters);
            listeners.notifyListeners(listeners.FiltersUpdateCheckReady, updatedFilters);

            return updatedFilters;
        } catch (e) {
            toasts.showFiltersUpdatedAlertMessage(false);
            listeners.notifyListeners(listeners.FiltersUpdateCheckReady);
        }
    }

    private static async onOptimizedFiltersSwitch(): Promise<void> {
        await FiltersApi.reloadEnabledFilters();
        await Engine.update();
    }

    private static async resetBlockedAdsCount(): Promise<void> {
        await PageStatsApi.reset();
    }
}
