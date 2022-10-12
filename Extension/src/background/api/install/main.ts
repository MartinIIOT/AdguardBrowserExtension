import {
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
     *
     * @returns client id string
     */
    public static genClientId(): string {
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
     * Initializes app install
     *
     * @param runInfo - info about extension start up
     * @param runInfo.currentAppVersion - current extension version
     * @param runInfo.currentSchemaVersion - current data schema version
     *
     */
    public static async install({ currentAppVersion, currentSchemaVersion }: RunInfo): Promise<void> {
        const clientId = InstallApi.genClientId();
        await storage.set(CLIENT_ID_KEY, clientId);

        await storage.set(SCHEMA_VERSION_KEY, currentSchemaVersion);
        await storage.set(APP_VERSION_KEY, currentAppVersion);
        await storage.set(ADGUARD_SETTINGS_KEY, defaultSettings);
    }
}
