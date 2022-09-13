import {
    APP_SCHEMA_VERSION,
    ADGUARD_SETTINGS_KEY,
    APP_VERSION_KEY,
    CLIENT_ID_KEY,
    SCHEMA_VERSION_KEY,
} from '../../../common/constants';
import { defaultSettings } from '../../../common/settings';
import { storage } from '../../storages';
import { RunInfo } from '../../utils';

export class InstallApi {
    /**
     * Generate client id
     */
    public static genClientId() {
        const result: string[] = [];
        const suffix = (Date.now()) % 1e8;
        const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890';
        for (let i = 0; i < 8; i += 1) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            result.push(symbol);
        }
        return result.join('') + suffix;
    }

    /**
     * Create client id and initialize default data
     */
    public static async install({ currentVersion }: RunInfo) {
        const clientId = InstallApi.genClientId();
        await storage.set(CLIENT_ID_KEY, clientId);

        await storage.set(SCHEMA_VERSION_KEY, APP_SCHEMA_VERSION);
        await storage.set(APP_VERSION_KEY, currentVersion);
        await storage.set(ADGUARD_SETTINGS_KEY, defaultSettings);
    }
}
