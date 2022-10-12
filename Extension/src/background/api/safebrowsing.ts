import browser from 'webextension-polyfill';
import SHA256 from 'crypto-js/sha256';

import { log } from '../../common/log';
import { strings } from '../../common/strings';
import { SB_SUSPENDED_CACHE_KEY, SAFEBROWSING_PAGE_PATH } from '../../common/constants';

import {
    storage,
    settingsStorage,
    sbCache,
    sbRequestCache,
} from '../storages';
import { ExtensionXMLHttpRequest, network } from './network';
import { UrlUtils } from '../utils/url';
import { SettingOption } from '../schema';

export class SafebrowsingApi {
    /**
     * If we've got an error response from the backend, suspend requests for
     * this time: 40 minutes
     */
    private static SUSPEND_TTL_MS = 40 * 60 * 1000;

    /**
     * Domain hash length
     */
    private static DOMAIN_HASH_LENGTH = 4;

    private static SB_ALLOW_LIST = 'allowlist';

    public static async initCache(): Promise<void> {
        await sbCache.init();
    }

    /**
     * Clears safebrowsing cache
     */
    public static async clearCache(): Promise<void> {
        await sbCache.clear();
    }

    /**
     * Temporarily allowlist URL
     * Adds URL to trusted sites (this URL will be ignored by safebrowsing filter)
     *
     * @param url URL
     */
    public static async addToSafebrowsingTrusted(url: string): Promise<void> {
        const host = UrlUtils.getHost(url);
        if (!host) {
            return;
        }

        await sbCache.set(SafebrowsingApi.createHash(host), SafebrowsingApi.SB_ALLOW_LIST);
    }

    /**
     * Checks URL with safebrowsing filter.
     * http://adguard.com/en/how-malware-blocked.html#extension
     *
     * @param requestUrl Request URL
     * @param referrerUrl Referrer URL
     */
    public static async checkSafebrowsingFilter(requestUrl: string, referrerUrl: string): Promise<string> {
        const safebrowsingDisabled = settingsStorage.get(SettingOption.DisableSafebrowsing);

        if (safebrowsingDisabled) {
            return;
        }

        log.debug('Checking safebrowsing filter for {0}', requestUrl);

        const sbList = await SafebrowsingApi.lookupUrl(requestUrl);

        if (!sbList) {
            log.debug('No safebrowsing rule found');
            return;
        }

        log.debug('Following safebrowsing filter has been fired: {0}', sbList);
        return SafebrowsingApi.getErrorPageURL(requestUrl, referrerUrl, sbList);
    }

    /**
     * Performs lookup to safebrowsing service
     *
     * @param requestUrl - request url
     *
     * @returns safebrowsing list we've detected or undefined
     */
    private static async lookupUrl(requestUrl: string): Promise<string | undefined> {
        const host = UrlUtils.getHost(requestUrl);
        if (!host) {
            return;
        }

        const hosts = SafebrowsingApi.extractHosts(host);
        if (!hosts || hosts.length === 0) {
            return;
        }

        // try find request url in cache
        let sbList = SafebrowsingApi.checkHostsInSbCache(hosts);
        if (sbList) {
            return SafebrowsingApi.createResponse(sbList);
        }

        // check safebrowsing is active
        const now = Date.now();
        const suspendedFrom = Number(await storage.get(SB_SUSPENDED_CACHE_KEY));
        if (suspendedFrom && (now - suspendedFrom) < SafebrowsingApi.SUSPEND_TTL_MS) {
            return;
        }

        const hashesMap = SafebrowsingApi.createHashesMap(hosts);
        const hashes = Object.keys(hashesMap);
        let shortHashes: string[] = [];
        for (let i = 0; i < hashes.length; i += 1) {
            shortHashes.push(hashes[i].substring(0, SafebrowsingApi.DOMAIN_HASH_LENGTH));
        }

        // Filter already checked hashes
        shortHashes = shortHashes.filter(x => !sbRequestCache.get(x));

        if (shortHashes.length === 0) {
            // In case we have not found anything in safebrowsingCache and all short hashes have been checked in
            // safebrowsingRequestsCache - means that there is no need to request backend again
            await sbCache.set(SafebrowsingApi.createHash(host), SafebrowsingApi.SB_ALLOW_LIST);
            return SafebrowsingApi.createResponse(SafebrowsingApi.SB_ALLOW_LIST);
        }

        let response: ExtensionXMLHttpRequest;

        try {
            response = await network.lookupSafebrowsing(shortHashes);
        } catch (e) {
            log.error('Error response from safebrowsing lookup server for {0}', host);
            await SafebrowsingApi.suspendSafebrowsing();
            return;
        }

        if (response && response.status >= 500) {
            // Error on server side, suspend request
            log.error('Error response status {0} received from safebrowsing lookup server.', response.status);
            await SafebrowsingApi.suspendSafebrowsing();
            return;
        }

        if (!response) {
            log.error('Can`t read response from the server');
            return;
        }

        await SafebrowsingApi.resumeSafebrowsing();

        shortHashes.forEach((x) => {
            sbRequestCache.set(x, true);
        });

        sbList = SafebrowsingApi.SB_ALLOW_LIST;

        if (response.status !== 204) {
            sbList = await SafebrowsingApi.processSbResponse(response.responseText, hashesMap)
            || SafebrowsingApi.SB_ALLOW_LIST;
        }

        await sbCache.set(SafebrowsingApi.createHash(host), sbList);
        return SafebrowsingApi.createResponse(sbList);
    }

    /**
     * Access Denied page URL
     *
     * @param requestUrl    Request URL
     * @param referrerUrl   Referrer URL
     * @param sbList        Safebrowsing list
     * @returns page URL
     */
    private static getErrorPageURL(
        requestUrl: string,
        referrerUrl: string,
        sbList: string,
    ): string {
        const listName = sbList || 'malware';
        const isMalware = strings.contains(listName, 'malware');
        let url = SAFEBROWSING_PAGE_PATH;
        url += `?malware=${isMalware}`;
        url += `&host=${encodeURIComponent(UrlUtils.getHost(requestUrl))}`;
        url += `&url=${encodeURIComponent(requestUrl)}`;
        url += `&ref=${encodeURIComponent(referrerUrl)}`;

        return browser.runtime.getURL(url);
    }

    /**
     * Parses safebrowsing service response
     *
     * @param responseText  Response text
     * @param hashesMap  Hashes hosts map
     * @returns Safebrowsing list or null
     */
    private static async processSbResponse(
        responseText: string,
        hashesMap: { [key: string]: string },
    ): Promise<string | null> {
        if (!responseText || responseText.length > 10 * 1024) {
            return null;
        }

        try {
            const data = responseText.split('\n')
                // filter empty lines
                .filter(line => !!line)
                .map(line => {
                    const row = line.split(':');

                    return {
                        hash: row[2],
                        list: row[0],
                    };
                });

            const saveTasks = data.map(({ hash, list }) => sbCache.set(hash, list));

            await Promise.all(saveTasks);

            const matched = data.find(({ hash }) => hashesMap[hash]);

            if (matched) {
                return matched.list;
            }

            return null;
        } catch (ex) {
            log.error('Error parse safebrowsing response, cause {0}', ex);
        }
        return null;
    }

    /**
     * Creates lookup callback parameter
     *
     * @param sbList    Safebrowsing list we've detected or null
     * @returns Safebrowsing list or null if this list is SB_ALLOW_LIST (means that site was allowlisted).
     */
    private static createResponse(sbList: string): string | null {
        return (sbList === SafebrowsingApi.SB_ALLOW_LIST) ? null : sbList;
    }

    /**
     * Resumes previously suspended work of SafebrowsingFilter
     */
    private static async resumeSafebrowsing(): Promise<void> {
        await storage.remove(SB_SUSPENDED_CACHE_KEY);
    }

    /**
     * Suspend work of SafebrowsingFilter (in case of backend error)
     */
    private static async suspendSafebrowsing(): Promise<void> {
        await storage.set(SB_SUSPENDED_CACHE_KEY, Date.now());
    }

    /**
     * Calculates hash for host string
     *
     * @param host - host string
     *
     * @returns host SHA256 hash
     */
    private static createHash(host: string): string {
        return SHA256(`${host}/`).toString().toUpperCase();
    }

    /**
     * Calculates SHA256 hashes for strings in hosts and then
     * gets prefixes for calculated hashes
     *
     * @param hosts -list of hosts
     *
     * @returns key value record, where key is calculated hash and value is host
     */
    private static createHashesMap(hosts: string[]): { [key: string]: string } {
        const result = Object.create(null);

        for (let i = 0; i < hosts.length; i += 1) {
            const host = hosts[i];
            const hash = SafebrowsingApi.createHash(host);
            result[hash] = host;
        }

        return result;
    }

    /**
     * Checks safebrowsing cache
     *
     * @param hosts - list of hosts
     *
     * @returns matched safebrowsing list name or null
     */
    private static checkHostsInSbCache(hosts: string[]): string | null {
        for (let i = 0; i < hosts.length; i += 1) {
            const sbList = sbCache.get(SafebrowsingApi.createHash(hosts[i]));
            if (sbList) {
                return sbList;
            }
        }
        return null;
    }

    /**
     * Extracts hosts from one host.
     * This method returns all sub-domains and IP address of the specified host.
     *
     * @param host - host string
     *
     * @returns list of sub-domains and ip addresses strings
     */
    private static extractHosts(host: string): string[] {
        const hosts = [];
        if (UrlUtils.isIpv4(host) || UrlUtils.isIpv6(host)) {
            hosts.push(host);
            return hosts;
        }

        const parts = host.split('.');
        if (parts.length <= 2) {
            hosts.push(host);
        } else {
            for (let i = 0; i <= parts.length - 2; i += 1) {
                hosts.push(strings.join(parts, '.', i, parts.length));
            }
        }

        return hosts;
    }
}
