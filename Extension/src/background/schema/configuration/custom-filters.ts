import zod from 'zod';

// Custom filters configuration

export const enum CustomFilterOption {
    CustomUrl = 'customUrl',
    Title = 'title',
    Trusted = 'trusted',
    Enabled = 'enabled',
}

export const customFiltersConfigValidator = zod.array(
    zod.object({
        [CustomFilterOption.CustomUrl]: zod.string(),
        [CustomFilterOption.Title]: zod.string().optional(),
        [CustomFilterOption.Trusted]: zod.boolean().optional(),
        [CustomFilterOption.Enabled]: zod.boolean().optional(),
    }),
);

export type CustomFiltersConfig = zod.infer<typeof customFiltersConfigValidator>;
