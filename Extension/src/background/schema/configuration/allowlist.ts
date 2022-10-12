import zod from 'zod';

// Allowlist configuration

export const enum AllowlistOption {
    Inverted = 'inverted',
    Domains = 'domains',
    InvertedDomains = 'inverted-domains',
    Enabled = 'enabled',
}

export const allowlistValidator = zod.object({
    [AllowlistOption.Domains]: zod.array(zod.string()),
    [AllowlistOption.InvertedDomains]: zod.array(zod.string()),
    [AllowlistOption.Enabled]: zod.boolean().optional(),
    [AllowlistOption.Inverted]: zod.boolean().optional(),
});

export type AllowlistConfig = zod.infer<typeof allowlistValidator>;
