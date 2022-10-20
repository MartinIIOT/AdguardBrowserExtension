import zod from 'zod';

export const groupI18nMetadataValidator = zod.object({
    name: zod.string(),
    description: zod.string(),
});

export type GroupI18nMetadata = zod.infer<typeof groupI18nMetadataValidator>;
