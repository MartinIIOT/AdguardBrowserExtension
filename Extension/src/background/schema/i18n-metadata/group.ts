import zod from 'zod';

export const groupI18nMetadataValidator = zod.record(
    zod.string(), zod.object({
        name: zod.string(),
    }),
);

export type GroupI18nMetadata = zod.infer<typeof groupI18nMetadataValidator>;
