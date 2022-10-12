import { trustedDomainsStorage } from '../storages';

export class DocumentBlockApi {
    private static TRUSTED_TTL_MS = 40 * 60 * 1000; // 40 min

    public static async init(): Promise<void> {
        try {
            const storageData = await trustedDomainsStorage.read();
            if (typeof storageData === 'string') {
                trustedDomainsStorage.setCache(JSON.parse(storageData));
            } else {
                await trustedDomainsStorage.setData([]);
            }
        } catch (e) {
            await trustedDomainsStorage.setData([]);
        }
    }

    public static async getTrustedDomains(): Promise<string[]> {
        const now = Date.now();

        // remove expired
        const data = trustedDomainsStorage.getData().filter(({ expires }) => now < expires);
        await trustedDomainsStorage.setData(data);

        return data.map(({ domain }) => domain);
    }

    public static async setTrustedDomain(url: string): Promise<void> {
        const { hostname } = new URL(url);

        const now = Date.now();

        // remove expired and duplicates
        const data = trustedDomainsStorage
            .getData()
            .filter(({ expires, domain }) => (now < expires) && (domain !== hostname));

        data.push({ domain: hostname, expires: DocumentBlockApi.TRUSTED_TTL_MS + now });

        await trustedDomainsStorage.setData(data);
    }
}
