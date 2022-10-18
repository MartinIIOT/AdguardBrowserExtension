import { Storage } from '../storage';

import { log } from '../../../../src/common/log';
import {
    FilterVersionData,
    FilterVersionStorageData,
} from '../../../../src/background/storages/filter-version';

export class VersionsApi {
    private versions: FilterVersionStorageData;

    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    public async init(): Promise<void> {
        const storageData = await this.storage.get('versions');

        if (typeof storageData !== 'string') {
            this.loadDefaultData();
            return;
        }

        try {
            this.versions = JSON.parse(storageData);
        } catch (e) {
            log.warn('Can`t parse data from versions storage, load default data');
            this.loadDefaultData();
        }
    }

    public getInstalledFilters(): number[] {
        return Object.keys(this.versions).map(id => Number(id));
    }

    public get(filterId: number): FilterVersionData {
        return this.versions[filterId];
    }

    public async set(filterId: number, data: FilterVersionData): Promise<void> {
        this.versions[filterId] = data;
        await this.saveData();
    }

    private async saveData(): Promise<void> {
        await this.storage.set('versions', JSON.stringify(this.versions));
    }

    private async loadDefaultData(): Promise<void> {
        this.versions = {};
        await this.saveData();
    }
}
