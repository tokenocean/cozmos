CREATE TABLE "public"."files" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "artwork_id" uuid NOT NULL, "hash" text NOT NULL, "type" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON UPDATE cascade ON DELETE cascade, UNIQUE ("id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
