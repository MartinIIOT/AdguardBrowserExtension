import { log } from '../../../common/log';
import { Engine } from '../../engine';
import { TabsApi } from '../extension';

export class AssistantApi {
    static async openAssistant(): Promise<void> {
        const activeTab = await TabsApi.getActive();

        if (activeTab?.id) {
            Engine.api.openAssistant(activeTab.id);
        } else {
            log.warn('Can`t open assistant in active tab');
        }
    }
}
