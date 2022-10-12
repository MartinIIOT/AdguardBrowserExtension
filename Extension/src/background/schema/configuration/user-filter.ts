import zod from 'zod';

// User filter configuration

export const enum UserFilterOption {
    Rules = 'rules',
    DisabledRules = 'disabled-rules',
    Enabled = 'enabled',
}

export const userFilterValidator = zod.object({
    [UserFilterOption.Rules]: zod.string(),
    [UserFilterOption.DisabledRules]: zod.string(),
    [UserFilterOption.Enabled]: zod.boolean().optional(),
});

export type UserFilterConfig = zod.infer<typeof userFilterValidator>;
