import { TsWebExtension, ConfigurationMV2 } from '@adguard/tswebextension';

import { Network } from './network';
import { Storage } from './storage';
import { FiltersApi } from './filters';

export type AdguardApiConfiguration = Omit<ConfigurationMV2, 'filters'> & { filters: number[] };

export class AdguardApi implements AdguardApi {
    public tswebextension: TsWebExtension;

    public filtersApi: FiltersApi;

    constructor(
        resourcesPath: string,
        filtersMetadataUrl: string,
        filterRulesUrl: string,
    ) {
        this.tswebextension = new TsWebExtension(resourcesPath);

        const network = new Network(filtersMetadataUrl, filterRulesUrl);

        const storage = new Storage();

        this.filtersApi = new FiltersApi(network, storage);
    }

    public async start(configuration: AdguardApiConfiguration): Promise<AdguardApiConfiguration> {
        await this.filtersApi.init();

        const { filters, ...rest } = configuration;

        await this.tswebextension.start({
            filters: await this.filtersApi.getFilters(filters),
            ...rest,
        });

        return configuration;
    }

    public async configure(configuration: AdguardApiConfiguration): Promise<AdguardApiConfiguration> {
        const { filters, ...rest } = configuration;

        await this.tswebextension.configure({
            filters: await this.filtersApi.getFilters(filters),
            ...rest,
        });

        return configuration;
    }
}
