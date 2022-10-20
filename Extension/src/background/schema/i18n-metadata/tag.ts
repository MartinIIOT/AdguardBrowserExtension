import zod from 'zod';

export const tagI18nMetadataValidator = zod.object({
    description: zod.string(),
    name: zod.string(),
});

export type TagI18nMetadata = zod.infer<typeof tagI18nMetadataValidator>;
