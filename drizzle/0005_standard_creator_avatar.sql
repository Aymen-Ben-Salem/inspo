UPDATE "creators"
SET "avatar_url" = '/brand/default-avatar.svg',
    "updated_at" = now()
WHERE "avatar_url" = '/brand/default-avatar.png';
