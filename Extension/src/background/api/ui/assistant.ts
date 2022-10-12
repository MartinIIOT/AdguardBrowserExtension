import { log } from '../../../common/log';
import { Engine } from '../../engine';
import { TabsApi } from '../extension';

/**
 * Extension assistant api
 */
export class AssistantApi {
    /**
     * Open assistant window in active tab
     */
    static async openAssistant(): Promise<void> {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.id) {
            Engine.api.openAssistant(activeTab.id);
        } else {
            log.warn('Can`t open assistant in active tab');
        }
    }
}
