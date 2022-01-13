alter table "public"."artworks" alter column "filename" drop not null;
alter table "public"."artworks" add column "filename" text;
