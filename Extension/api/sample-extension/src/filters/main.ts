import { Network } from '../network';
import { Storage } from '../storage';
import { MetadataApi } from './metadata';
import { VersionsApi } from './versions';

import { log } from '../../../../src/common/log';
import { BrowserUtils } from '../../../../src/background/utils/browser-utils';
import { CommonFilterMetadata } from '../../../../src/background/storages/metadata';
import { FilterRulesApi } from './rules';

export class FiltersApi {
    // update checking initialization delay
    private static initDelay = 1000 * 60 * 5; // 5 min

    // update checking period
    private static checkPeriodMs = 1000 * 60 * 30; // 30 min

    private updateTimerId: number;

    private metadataApi: MetadataApi;

    private versionsApi: VersionsApi;

    private filterRulesApi: FilterRulesApi;

    private network: Network;

    constructor(
        network: Network,
        storage: Storage,
    ) {
        this.metadataApi = new MetadataApi(network, storage);
        this.versionsApi = new VersionsApi(storage);
        this.filterRulesApi = new FilterRulesApi(storage);
        this.network = network;
    }

    public async init(): Promise<void> {
        await this.metadataApi.init();
        await this.versionsApi.init();

        setTimeout(async () => {
            await this.scheduleUpdate();
        }, FiltersApi.initDelay);
    }

    public async getFilters(filterIds: number[]): Promise<{
        content: string;
        filterId: number;
        trusted: boolean;
    }[]> {
        const tasks = filterIds.map(id => this.getFilter(id));

        return Promise.all(tasks);
    }

    private async getFilter(filterId: number): Promise<{
        content: string;
        filterId: number;
        trusted: boolean;
    }> {
        let rules = await this.filterRulesApi.get(filterId);

        if (!Array.isArray(rules)) {
            rules = await this.loadFilterRules(filterId);
        }

        return {
            filterId,
            content: (rules || []).join('\n'),
            trusted: true,
        };
    }

    public async scheduleUpdate(): Promise<void> {
        if (this.updateTimerId) {
            window.clearTimeout(this.updateTimerId);
        }

        await this.updateFilters();

        this.updateTimerId = window.setTimeout(async () => {
            await this.scheduleUpdate();
        }, FiltersApi.checkPeriodMs);
    }

    /**
     * Update filters
     */
    private async updateFilters(): Promise<void> {
        log.info('Check filters updates...');
        /**
         * Reload filters metadata from backend for correct
         * version matching on update check.
         */
        await this.metadataApi.loadMetadata();

        const ids = this.versionsApi.getInstalledFilters();

        const updateTasks = ids.map(async (id) => this.updateFilter(id));

        await Promise.allSettled(updateTasks);
    }

    /**
     * Update filter
     *
     * @param filterId - filter id
     *
     * @returns updated filter metadata or null, if update is not required
     */
    private async updateFilter(filterId: number): Promise<CommonFilterMetadata | null> {
        log.info(`Check filter ${filterId} update ...`);

        const filterMetadata = this.metadataApi.getFilterMetadata(filterId);

        if (!filterMetadata) {
            log.error(`Can't find filter ${filterId} metadata`);
            return null;
        }

        if (!this.isFilterNeedUpdate(filterMetadata)) {
            log.info(`Filter ${filterId} is already updated`);
            return null;
        }

        try {
            await this.loadFilterRules(filterId);
            log.info(`Successfully update filter ${filterId}`);
            return filterMetadata;
        } catch (e) {
            log.error(e);
            return null;
        }
    }

    /**
     * Checks if common filter need update.
     * Matches version from updated metadata with data in filter version storage.
     *
     * @param filterMetadata - updated filter metadata
     *
     * @returns true, if filter update is required, else returns false.
     */
    private isFilterNeedUpdate(filterMetadata: CommonFilterMetadata): boolean {
        log.info(`Check if filter ${filterMetadata.filterId} need to update`);

        const filterVersion = this.versionsApi.get(filterMetadata.filterId);

        // filter is not installed
        if (!filterVersion) {
            return false;
        }

        return !BrowserUtils.isGreaterOrEqualsVersion(filterVersion.version, filterMetadata.version);
    }

    private async loadFilterRules(filterId: number): Promise<string[] | undefined> {
        const filterMetadata = this.metadataApi.getFilterMetadata(filterId);

        if (!filterMetadata) {
            log.error(`filter ${filterId} metadata is not found`);
            return;
        }

        const rules = await this.network.downloadFilterRules(filterId);
        await this.filterRulesApi.set(filterId, rules);

        const {
            version,
            expires,
            timeUpdated,
        } = filterMetadata;

        this.versionsApi.set(filterId, {
            version,
            expires,
            lastUpdateTime: new Date(timeUpdated).getTime(),
            lastCheckTime: Date.now(),
        });

        return rules;
    }
}
