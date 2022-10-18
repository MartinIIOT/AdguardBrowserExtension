import { FilteringLogEvent, MESSAGE_HANDLER_NAME } from '@adguard/tswebextension';
import { AdguardApi, AdguardApiConfiguration } from './src';

(async (): Promise<void> => {
    const adguardApi = new AdguardApi(
        'adguard',
        'https://filters.adtidy.org/extension/chromium/filters.json',
        'https://filters.adtidy.org/extension/chromium/filters/{filter_id}.txt',
    );

    // console log request process events
    const onFilteringLogEvent = (event: FilteringLogEvent) => {
        console.log(event);
    };

    adguardApi.tswebextension.onFilteringLogEvent.subscribe(onFilteringLogEvent);

    const config: AdguardApiConfiguration = {
        filters: [2],
        allowlist: ['www.avira.com'],
        trustedDomains: [],
        userrules: ['example.org##h1'],
        verbose: false,
        settings: {
            filteringEnabled: true,
            stealthModeEnabled: true,
            collectStats: true,
            allowlistInverted: false,
            allowlistEnabled: true,
            stealth: {
                blockChromeClientData: false,
                hideReferrer: false,
                hideSearchQueries: false,
                sendDoNotTrack: false,
                blockWebRTC: false,
                selfDestructThirdPartyCookies: true,
                selfDestructThirdPartyCookiesTime: 3600,
                selfDestructFirstPartyCookies: true,
                selfDestructFirstPartyCookiesTime: 3600,
            },
        },
    };

    await adguardApi.start(config);

    console.log('Finished Adguard API initialization.');

    config.allowlist.push('www.google.com');

    await adguardApi.configure(config);

    console.log('Finished Adguard API re-configuration');

    // update config on assistant rule apply
    adguardApi.tswebextension.onAssistantCreateRule.subscribe(async (rule) => {
        console.log(`Rule ${rule} was created by Adguard Assistant`);
        config.userrules.push(rule);
        await adguardApi.configure(config);
        console.log('Finished Adguard API re-configuration');
    });

    const tsWebExtensionMessageHandler = adguardApi.tswebextension.getMessageHandler();

    // add message assistant message listener
    chrome.runtime.onMessage.addListener((message, sender) => {
        if (message.handlerName === MESSAGE_HANDLER_NAME) {
            return tsWebExtensionMessageHandler(message, sender);
        }

        switch (message.type) {
            case 'OPEN_ASSISTANT': {
                chrome.tabs.query({ active: true }, (res) => {
                    if (res.length > 0 && res[0].id) {
                        adguardApi.tswebextension.openAssistant(res[0].id);
                    }
                });
                break;
            }
            default:
            // do nothing
        }
    });

    // Disable Adguard in 1 minute
    setTimeout(async () => {
        adguardApi.tswebextension.onFilteringLogEvent.unsubscribe(onFilteringLogEvent);
        await adguardApi.tswebextension.stop();
        console.log('Adguard API has been disabled.');
    }, 60 * 1000);
})();
