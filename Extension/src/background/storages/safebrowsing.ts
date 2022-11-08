/**
 * @file
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adguard Browser Extension. If not, see <http://www.gnu.org/licenses/>.
 */
import { LRUMap } from 'lru_map';
import { SB_LRU_CACHE_KEY } from '../../common/constants';
import { log } from '../../common/log';
import { storage } from './main';

/**
 * Class for control persisted {@link LRUMap} safebrowsing cache
 */
export class SbCache {
    private cache = new LRUMap<string, string>(1000);

    /**
     * Reads safebrowsing {@link LRUMap} stringified entries from {@link storage},
     * parse it and sets to {@link cache}
     *
     * @returns promise, resolved when data successfully initialized
     */
    public async init(): Promise<void> {
        const storageData = await storage.get(SB_LRU_CACHE_KEY);

        if (typeof storageData !== 'string') {
            return;
        }

        try {
            const entries = JSON.parse(storageData);
            this.cache.assign(entries);
        } catch (e) {
            log.error(e.message);
        }
    }

    /**
     * Saves stringified safebrowsing {@link cache} entries in {@link storage}
     */
    public async save(): Promise<void> {
        await storage.set(SB_LRU_CACHE_KEY, JSON.stringify(this.cache.toJSON()));
    }

    /**
     * Gets value from {@link cache}
     *
     * @param key - cache key
     * @returns cache value
     */
    public get(key: string): string {
        return this.cache.get(key);
    }

    /**
     * Sets value to {@link cache}
     *
     * @param key - cache key
     * @param value - cache value
     * @returns updated {@link SbCache} instance
     */
    public async set(key: string, value: string): Promise<SbCache> {
        this.cache.set(key, value);

        if (this.cache.size % 20 === 0) {
            await this.save();
        }

        return this;
    }

    /**
     * Clear {@link cache} and {@link storage} data
     */
    public async clear(): Promise<void> {
        this.cache.clear();
        await this.save();
    }
}

export const sbCache = new SbCache();

export const sbRequestCache = new LRUMap(1000);
