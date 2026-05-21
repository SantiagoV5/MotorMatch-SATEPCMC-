ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS "dealerships" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(160) NOT NULL,
  "address" VARCHAR(255) NOT NULL,
  "city" VARCHAR(100),
  "department" VARCHAR(100),
  "latitude" DECIMAL(10, 7) NOT NULL,
  "longitude" DECIMAL(10, 7) NOT NULL,
  "phone" VARCHAR(30),
  "whatsapp" VARCHAR(30),
  "website" TEXT,
  "maps_url" TEXT,
  "is_official" BOOLEAN NOT NULL DEFAULT true,
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "dealership_brands" (
  "id" SERIAL PRIMARY KEY,
  "dealership_id" INTEGER NOT NULL,
  "brand" VARCHAR(50) NOT NULL,
  CONSTRAINT "dealership_brands_dealership_id_fkey"
    FOREIGN KEY ("dealership_id")
    REFERENCES "dealerships"("id")
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "dealership_motorcycles" (
  "id" SERIAL PRIMARY KEY,
  "dealership_id" INTEGER NOT NULL,
  "motorcycle_id" INTEGER NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "notes" VARCHAR(300),
  CONSTRAINT "dealership_motorcycles_dealership_id_fkey"
    FOREIGN KEY ("dealership_id")
    REFERENCES "dealerships"("id")
    ON DELETE CASCADE,
  CONSTRAINT "dealership_motorcycles_motorcycle_id_fkey"
    FOREIGN KEY ("motorcycle_id")
    REFERENCES "motorcycles"("id")
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "unique_dealership_brand"
ON "dealership_brands"("dealership_id", "brand");

CREATE INDEX IF NOT EXISTS "idx_dealership_brands_brand"
ON "dealership_brands"("brand");

CREATE UNIQUE INDEX IF NOT EXISTS "unique_dealership_motorcycle"
ON "dealership_motorcycles"("dealership_id", "motorcycle_id");

CREATE INDEX IF NOT EXISTS "idx_dealership_motorcycles_motorcycle"
ON "dealership_motorcycles"("motorcycle_id");

CREATE INDEX IF NOT EXISTS "idx_dealerships_active_featured"
ON "dealerships"("is_active", "is_featured", "priority");
