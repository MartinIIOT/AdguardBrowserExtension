import zod from 'zod';

export const tagMetadataValidator = zod.object({
    description: zod.string(),
    keyword: zod.string(),
    name: zod.string(),
    tagId: zod.number(),
});

export type TagMetadata = zod.infer<typeof tagMetadataValidator>;
