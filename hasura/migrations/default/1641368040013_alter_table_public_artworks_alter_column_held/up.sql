alter table "public"."artworks" alter column "held" type text;
alter table "public"."artworks" alter column "held" set default 'singlesig';
