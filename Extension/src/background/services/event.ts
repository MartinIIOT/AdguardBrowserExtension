import browser, { Runtime } from 'webextension-polyfill';
import { listeners } from '../notifier';
import { messageHandler } from '../message-handler';
import { CreateEventListenerMessage, MessageType } from '../../common/messages';

export type CreateEventListenerResponse = {
    listenerId: number,
};

// TODO: remove listener
export class EventService {
    eventListeners = {};

    constructor() {
        this.createEventListener = this.createEventListener.bind(this);
    }

    public init(): void {
        messageHandler.addListener(MessageType.CreateEventListener, this.createEventListener);
    }

    private async createEventListener(
        message: CreateEventListenerMessage,
        sender: Runtime.MessageSender,
    ): Promise<CreateEventListenerResponse> {
        const { events } = message.data;

        const listenerId = listeners.addSpecifiedListener(events, (...args) => {
            const sender = this.eventListeners[listenerId];
            if (sender) {
                browser.tabs.sendMessage(sender.tab.id, {
                    type: MessageType.NotifyListeners,
                    data: args,
                });
            }
        });

        this.eventListeners[listenerId] = sender;
        return { listenerId };
    }
}

export const eventService = new EventService();
