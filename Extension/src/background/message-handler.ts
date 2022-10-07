import browser, { Runtime } from 'webextension-polyfill';
import { Engine, EngineMessage } from './engine';

import {
    MessageType,
    Message,
    ExtractedMessage,
    APP_MESSAGE_HANDLER_NAME,
} from '../common/messages';

export type MessageListener<T> = (message: T, sender: Runtime.MessageSender) => Promise<unknown> | unknown;

export class MessageHandler {
  private listeners = new Map();

  constructor() {
      this.handleMessage = this.handleMessage.bind(this);
  }

  public init(): void {
      browser.runtime.onMessage.addListener(this.handleMessage);
  }

  public addListener<T extends MessageType>(type: T, listener: MessageListener<ExtractedMessage<T>>): void {
      if (this.listeners.has(type)) {
          throw new Error(`Message handler: ${type} listener has already been registered`);
      }

      this.listeners.set(type, listener);
  }

  public removeListener<T extends MessageType>(type: T): void {
      this.listeners.delete(type);
  }

  private handleMessage<T extends Message | EngineMessage>(
      message: T,
      sender: Runtime.MessageSender,
  ): Promise<unknown> | undefined {
      if (message.handlerName === Engine.messageHandlerName) {
          return Engine.handleMessage(message, sender);
      }

      if (message.handlerName === APP_MESSAGE_HANDLER_NAME) {
          const listener = this.listeners.get(message.type) as MessageListener<T>;
          if (listener) {
              return Promise.resolve(listener(message, sender));
          }
      }
  }
}

export const messageHandler = new MessageHandler();
