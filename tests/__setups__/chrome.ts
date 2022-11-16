import browser from 'sinon-chrome';

jest.mock('webextension-polyfill', () => ({
    ...browser,
    webRequest: {
        ...browser.webRequest,
        filterResponseData: jest.fn(),
    },
    runtime: {
        ...browser.runtime,
        getURL: () => 'chrome-extension://test',
        getManifest: () => ({ version: '0.0.0' }),
    },
    i18n: {
        ...browser.i18n,
        getUILanguage: () => 'en',
        getMessage: (value: string) => value,
    },
}));

jest.mock('nanoid', () => ({
    nanoid: () => '1',
}));
