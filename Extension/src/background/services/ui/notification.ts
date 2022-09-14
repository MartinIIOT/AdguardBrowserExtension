import { MessageType } from '../../../common/messages';
import { notificationApi } from '../../api';
import { messageHandler } from '../../message-handler';

/**
 * Service that manages adguard events notifications.
 * @constructor
 */
export class NotificationService {
    public static init() {
        notificationApi.init();

        messageHandler.addListener(MessageType.SET_NOTIFICATION_VIEWED, NotificationService.setNotificationViewed);
    }

    private static async setNotificationViewed({ data }) {
        const { withDelay } = data;

        await notificationApi.setNotificationViewed(withDelay);
    }
}
