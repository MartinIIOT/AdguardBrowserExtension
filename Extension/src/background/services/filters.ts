import {
    AddAndEnableFilterMessage,
    DisableAntiBannerFilterMessage,
    MessageType,
} from '../../common/messages';
import { SettingOption } from '../schema';

import { messageHandler } from '../message-handler';
import { Engine } from '../engine';
import { FiltersApi, FilterUpdateApi, toasts } from '../api';
import { filterStateStorage, groupStateStorage } from '../storages';
import {
    ContextMenuAction,
    contextMenuEvents,
    settingsEvents,
} from '../events';
import { listeners } from '../notifier';

export class FiltersService {
    static async init() {
        // TODO: debounce message events
        messageHandler.addListener(MessageType.AddAndEnableFilter, FiltersService.onFilterEnable);
        messageHandler.addListener(MessageType.DisableAntibannerFilter, FiltersService.onFilterDisable);
        messageHandler.addListener(MessageType.EnableFiltersGroup, FiltersService.onGroupEnable);
        messageHandler.addListener(MessageType.DisableFiltersGroup, FiltersService.onGroupDisable);

        messageHandler.addListener(MessageType.CheckAntibannerFiltersUpdate, FiltersService.checkFiltersUpdate);
        contextMenuEvents.addListener(ContextMenuAction.UpdateAntibannerFilters, FiltersService.checkFiltersUpdate);

        settingsEvents.addListener(SettingOption.UseOptimizedFilters, FiltersService.onOptimizedFiltersSwitch);
    }

    static async onFilterEnable(message: AddAndEnableFilterMessage) {
        const { filterId } = message.data;

        await FiltersApi.loadAndEnableFilters([filterId]);

        await Engine.update();
    }

    static async onFilterDisable(message: DisableAntiBannerFilterMessage) {
        const { filterId } = message.data;

        filterStateStorage.disableFilters([filterId]);

        await Engine.update();
    }

    static async onGroupEnable(message) {
        const { groupId } = message.data;

        groupStateStorage.enableGroups([groupId]);
        await Engine.update();
    }

    static async onGroupDisable(message) {
        const { groupId } = message.data;

        groupStateStorage.disableGroups([groupId]);
        await Engine.update();
    }

    static async checkFiltersUpdate() {
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

    static async onOptimizedFiltersSwitch() {
        await FiltersApi.reloadEnabledFilters();
        await Engine.update();
    }
}
