import zod from 'zod';

import { generalSettingsConfigValidator } from './general-settings';
import { extensionSpecificSettingsConfigValidator } from './extension-specific-settings';
import { filtersConfigValidator } from './filters';
import { stealthConfigValidator } from './stealth';

// Root configuration

export const ProtocolVersion = '1.0';

export const enum RootOption {
    ProtocolVersion = 'protocol-version',
    GeneralSettings = 'general-settings',
    ExtensionSpecificSettings = 'extension-specific-settings',
    Filters = 'filters',
    Stealth = 'stealth',
}

export const configValidator = zod.object({
    [RootOption.ProtocolVersion]: zod.literal(ProtocolVersion),
    [RootOption.GeneralSettings]: generalSettingsConfigValidator,
    [RootOption.ExtensionSpecificSettings]: extensionSpecificSettingsConfigValidator,
    [RootOption.Filters]: filtersConfigValidator,
    [RootOption.Stealth]: stealthConfigValidator.optional(),
});

export type Config = zod.infer<typeof configValidator>;
