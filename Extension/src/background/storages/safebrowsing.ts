import { LRUMap } from 'lru_map';
import { SB_LRU_CACHE_KEY } from '../../common/constants';
import { storage } from './main';

export class SbCache {
    private cache = new LRUMap<string, string>(1000);

    public async init() {
        const storageData = await storage.get(SB_LRU_CACHE_KEY);

        if (typeof storageData !== 'string') {
            return;
        }

        try {
            const entries = JSON.parse(storageData);
            this.cache.assign(entries);
        } catch (e) {
            // do nothing
        }
    }

    public async save(): Promise<void> {
        await storage.set(SB_LRU_CACHE_KEY, JSON.stringify(this.cache.toJSON()));
    }

    public get(key: string): string {
        return this.cache.get(key);
    }

    public async set(key: string, value: string): Promise<SbCache> {
        this.cache.set(key, value);

        if (this.cache.size % 20 === 0) {
            await this.save();
        }

        return this;
    }

    public async clear(): Promise<void> {
        this.cache.clear();
        await this.save();
    }
}

export const sbCache = new SbCache();

export const sbRequestCache = new LRUMap(1000);
