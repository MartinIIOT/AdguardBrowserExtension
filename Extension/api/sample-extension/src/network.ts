import FiltersDownloader from '@adguard/filters-downloader';

import { UserAgent } from '../../../src/common/user-agent';
import { Metadata } from '../../../src/background/storages/metadata';

export class Network {
    /**
     * FiltersDownloader constants
     */
    private filterCompilerConditionsConstants = {
        adguard: true,
        adguard_ext_chromium: UserAgent.isChrome,
        adguard_ext_firefox: UserAgent.isFirefox,
        adguard_ext_edge: UserAgent.isEdge,
        adguard_ext_safari: false,
        adguard_ext_opera: UserAgent.isOpera,
    };

    constructor(
        private filtersMetadataUrl: string,
        private filterRulesUrl: string,
    ) {}

    /**
     * Downloads filter rules by filter ID
     *
     * @param filterId - Filter id
     */
    public async downloadFilterRules(filterId: number): Promise<string[]> {
        const url = this.filterRulesUrl.replace('{filter_id}', String(filterId));

        return FiltersDownloader.download(url, this.filterCompilerConditionsConstants);
    }

    /**
     * Downloads filters metadata
     */
    public async downloadFiltersMetadata(): Promise<Metadata> {
        const response = await fetch(this.filtersMetadataUrl);

        const metadata = await response.json();

        if (!metadata) {
            throw new Error(`Invalid response: ${response}`);
        }

        return metadata;
    }
}
