import { network } from '../../network';

/**
 * Helper class for custom filters downloading with specified request time limitation
 */
export class CustomFilterLoader {
    /**
     * Custom filter rules downloading limit in ms
     */
    private static DOWNLOAD_LIMIT_MS = 3 * 1000;

    /**
     * Limits custom filter rules downloading with timeout
     *
     * @param url - custom filter download url
     * @throws error if filter was not downloaded in {@link DOWNLOAD_LIMIT_MS}
     * @returns downloaded custom filter rules
     */
    public static async downloadRulesWithTimeout(url: string): Promise<string[]> {
        return Promise.race([
            network.downloadFilterRulesBySubscriptionUrl(url),
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Fetch timeout is over')), CustomFilterLoader.DOWNLOAD_LIMIT_MS);
            }),
        ]);
    }
}
