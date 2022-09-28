import { TRUSTED_DOCUMENTS_CACHE_KEY } from '../../common/constants';

import { StringStorage } from '../utils/string-storage';
import { storage } from './main';

export type TrustedDomainData = {
    domain: string,
    expires: number,
};

export const trustedDomainsStorage = new StringStorage<
    typeof TRUSTED_DOCUMENTS_CACHE_KEY,
    TrustedDomainData[],
    'async'
>(TRUSTED_DOCUMENTS_CACHE_KEY, storage);
