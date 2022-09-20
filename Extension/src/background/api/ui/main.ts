import { BACKGROUND_TAB_ID, TabContext } from '@adguard/tswebextension';
import { debounce } from 'lodash';

import { ContextMenuApi } from './context-menu';
import { FramesApi } from './frames';
import { IconsApi } from './icons';

export class UiApi {
    public static async updateTabIconAndContextMenu(tabContext: TabContext) {
        const tabId = tabContext?.info?.id;

        if (!tabId || tabId === BACKGROUND_TAB_ID) {
            return;
        }

        const frameData = FramesApi.getMainFrameData(tabContext);

        await IconsApi.updateTabIcon(tabId, frameData);
        ContextMenuApi.updateMenu(frameData);
    }

    public static debounceUpdateTabIconAndContextMenu(tabContext: TabContext) {
        debounce(() => UiApi.updateTabIconAndContextMenu(tabContext), 100)();
    }
}
