import { BACKGROUND_TAB_ID, TabContext } from '@adguard/tswebextension';
import { debounce } from 'lodash';
import { MessageType, sendMessage } from '../../../common/messages';

import { ContextMenuApi } from './context-menu';
import { FrameData, FramesApi } from './frames';
import { IconsApi } from './icons';

export class UiApi {
    public static async update(tabContext: TabContext): Promise<void> {
        const tabId = tabContext?.info?.id;

        if (!tabId || tabId === BACKGROUND_TAB_ID) {
            return;
        }

        const frameData = FramesApi.getMainFrameData(tabContext);

        await ContextMenuApi.updateMenu(frameData);

        debounce(() => {
            IconsApi.updateTabIcon(tabId, frameData);
            UiApi.broadcastTotalBlockedMessage(frameData);
        }, 100)();
    }

    private static async broadcastTotalBlockedMessage({ totalBlocked, totalBlockedTab }: FrameData): Promise<void> {
        try {
            sendMessage<MessageType.UPDATE_TOTAL_BLOCKED>({
                type: MessageType.UPDATE_TOTAL_BLOCKED,
                data: {
                    totalBlocked,
                    totalBlockedTab,
                },
            });
        } catch (e) {
            // do nothing
        }
    }
}
