import zod, { z } from 'zod';

export const regularFilterI18nMetadataValidator = zod.object({
    description: zod.string(),
    name: zod.string(),
});

export type RegularFilterI18nMetadata = z.infer<typeof regularFilterI18nMetadataValidator>;
