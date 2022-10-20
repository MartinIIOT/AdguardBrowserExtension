import zod from 'zod';

export const regularFilterI18nMetadataValidator = zod.record(
    zod.string(), zod.object({
        description: zod.string(),
        name: zod.string(),
    }),
);

export type RegularFilterI18nMetadata = zod.infer<typeof regularFilterI18nMetadataValidator>;
