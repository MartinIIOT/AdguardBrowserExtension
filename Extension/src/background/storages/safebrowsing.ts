import { LRUMap } from 'lru_map';
import { SB_LRU_CACHE_KEY } from '../../common/constants';
import { LruCache } from '../utils/lru-cache';
import { storage } from './main';

export const sbCache = new LruCache<typeof SB_LRU_CACHE_KEY, string, string, 'async'>(
    SB_LRU_CACHE_KEY,
    storage,
);

export const sbRequestCache = new LRUMap(1000);
