import { MessageType } from '../../../common/messages';
import { notificationApi } from '../../api';
import { messageHandler } from '../../message-handler';

/**
 * Service that manages adguard events notifications.
 */
export class NotificationService {
    public static init(): void {
        notificationApi.init();

        messageHandler.addListener(MessageType.SET_NOTIFICATION_VIEWED, NotificationService.setNotificationViewed);
    }

    private static async setNotificationViewed({ data }): Promise<void> {
        const { withDelay } = data;

        await notificationApi.setNotificationViewed(withDelay);
    }
}
