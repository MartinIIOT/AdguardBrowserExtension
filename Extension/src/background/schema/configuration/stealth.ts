import zod from 'zod';

// Stealth configuration

export const enum StealthOption {
    DisableStealthMode = 'stealth_disable_stealth_mode',
    HideReferrer = 'stealth-hide-referrer',
    HideSearchQueries = 'stealth-hide-search-queries',
    SendDoNotTrack = 'stealth-send-do-not-track',
    BlockWebRTC = 'stealth-block-webrtc',
    RemoveXClientData = 'stealth-remove-x-client',
    BlockThirdPartyCookies = 'stealth-block-third-party-cookies',
    BlockThirdPartyCookiesTime = 'stealth-block-third-party-cookies-time',
    BlockFirstPartyCookies = 'stealth-block-first-party-cookies',
    BlockFirstPartyCookiesTime = 'stealth-block-first-party-cookies-time',
    BlockKnownTrackers = 'block-known-trackers',
    StripTrackingParams = 'strip-tracking-parameters',
}

export const stealthConfigValidator = zod.object({
    [StealthOption.DisableStealthMode]: zod.boolean(),
    [StealthOption.HideReferrer]: zod.boolean(),
    [StealthOption.HideSearchQueries]: zod.boolean(),
    [StealthOption.SendDoNotTrack]: zod.boolean(),
    [StealthOption.BlockWebRTC]: zod.boolean(),
    [StealthOption.RemoveXClientData]: zod.boolean(),
    [StealthOption.BlockThirdPartyCookies]: zod.boolean(),
    [StealthOption.BlockThirdPartyCookiesTime]: zod.number().int().optional(),
    [StealthOption.BlockFirstPartyCookies]: zod.boolean(),
    [StealthOption.BlockFirstPartyCookiesTime]: zod.number().int().optional(),
    [StealthOption.BlockKnownTrackers]: zod.boolean().optional(),
    [StealthOption.StripTrackingParams]: zod.boolean(),
});

export type StealthConfig = zod.infer<typeof stealthConfigValidator>;
