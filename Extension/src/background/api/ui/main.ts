import { BACKGROUND_TAB_ID, TabContext } from '@adguard/tswebextension';
import { debounce } from 'lodash';

import { ContextMenuApi } from './context-menu';
import { FrameData, FramesApi } from './frames';
import { IconsApi } from './icons';

export class UiApi {
    public static async updateTabIconAndContextMenu(tabContext: TabContext) {
        const tabId = tabContext?.info?.id;

        if (!tabId || tabId === BACKGROUND_TAB_ID) {
            return;
        }

        const frameData = FramesApi.getMainFrameData(tabContext);

        await ContextMenuApi.updateMenu(frameData);
        UiApi.debounceUpdateTabIcon(tabId, frameData);
    }

    private static debounceUpdateTabIcon(tabId: number, frameData: FrameData) {
        debounce(() => IconsApi.updateTabIcon(tabId, frameData), 100)();
    }
}
