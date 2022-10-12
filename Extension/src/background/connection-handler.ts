import browser, { Runtime } from 'webextension-polyfill';

import {
    FILTERING_LOG,
    FULLSCREEN_USER_RULES_EDITOR,
} from '../common/constants';

import { MessageType } from '../common/messages';

import { log } from '../common/log';
import { listeners } from './notifier';
import { filteringLogApi } from './api';
import { fullscreenUserRulesEditor } from './services';

export class ConnectionHandler {
    public static init(): void {
        browser.runtime.onConnect.addListener(ConnectionHandler.handleConnection);
    }

    private static handleConnection(port: Runtime.Port): void {
        let listenerId: number;

        log.info(`Port: "${port.name}" connected`);

        ConnectionHandler.onPortConnection(port);

        port.onMessage.addListener((message) => {
            const { type, data } = message;
            if (type === MessageType.AddLongLivedConnection) {
                const { events } = data;
                listenerId = listeners.addSpecifiedListener(events, async (...data) => {
                    const type = MessageType.NotifyListeners;
                    try {
                        port.postMessage({ type, data });
                    } catch (e) {
                        log.error(e.message);
                    }
                });
            }
        });

        port.onDisconnect.addListener(() => {
            ConnectionHandler.onPortDisconnection(port);
            listeners.removeListener(listenerId);
            log.info(`Port: "${port.name}" disconnected`);
        });
    }

    private static onPortConnection(port: Runtime.Port): void {
        switch (true) {
            case port.name.startsWith(FILTERING_LOG): {
                filteringLogApi.onOpenFilteringLogPage();
                break;
            }

            case port.name.startsWith(FULLSCREEN_USER_RULES_EDITOR): {
                fullscreenUserRulesEditor.onOpenPage();
                break;
            }

            default: {
                throw new Error(`There is no such pages ${port.name}`);
            }
        }
    }

    private static onPortDisconnection(port: Runtime.Port): void {
        switch (true) {
            case port.name.startsWith(FILTERING_LOG): {
                filteringLogApi.onCloseFilteringLogPage();
                break;
            }

            case port.name.startsWith(FULLSCREEN_USER_RULES_EDITOR): {
                fullscreenUserRulesEditor.onClosePage();
                break;
            }

            default: {
                throw new Error(`There is no such pages ${port.name}`);
            }
        }
    }
}
