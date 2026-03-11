-- Drop the old firebase_uid unique constraint and column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_firebase_uid_key;
ALTER TABLE users DROP COLUMN IF EXISTS firebase_uid;
