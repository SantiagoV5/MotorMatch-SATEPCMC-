ALTER TABLE "questionnaires"
ADD COLUMN IF NOT EXISTS "usage_types" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "motorcycle_type_experience" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "riding_experience_years" INTEGER;
