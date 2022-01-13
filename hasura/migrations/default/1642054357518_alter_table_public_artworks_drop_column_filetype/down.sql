alter table "public"."artworks" alter column "filetype" drop not null;
alter table "public"."artworks" add column "filetype" text;
