import { ADGUARD_SETTINGS_KEY, APP_VERSION_KEY } from '../../common/constants';
import { Prefs } from '../prefs';
import { storage } from '../storages';

export type RunInfo = {
    currentVersion: string,
    previousVersion: string | null,
    isUpdate: boolean,
    isInstall: boolean,
};

async function getPreviousVersion(): Promise<string | null> {
    const previousVersion = await storage.get(APP_VERSION_KEY);

    if (typeof previousVersion === 'string') {
        return previousVersion;
    }

    // fallback
    const settings = await storage.get(ADGUARD_SETTINGS_KEY);

    if (typeof settings === 'object'
        && typeof settings?.[APP_VERSION_KEY] === 'string'
    ) {
        return settings[APP_VERSION_KEY];
    }

    return null;
}

export async function getRunInfo(): Promise<RunInfo> {
    const currentVersion = Prefs.version;

    const previousVersion = await getPreviousVersion();

    const isVersionChanged = previousVersion !== currentVersion;

    const isInstall = isVersionChanged && !previousVersion;
    const isUpdate = isVersionChanged && !!previousVersion;

    return {
        previousVersion,
        currentVersion,
        isUpdate,
        isInstall,
    };
}
