<<<<<<< HEAD
CREATE
OR REPLACE VIEW "public"."currentuser" AS
SELECT
  users.id,
  users.created_at,
  users.updated_at,
  users.display_name,
  users.avatar_url,
  users.username,
  users.location,
  users.bio,
  users.website,
  users.email,
  users.full_name,
  users.mnemonic,
  users.address,
  users.multisig,
  users.is_artist,
  users.is_admin,
  users.wallet_initialized,
  users.twitter,
  users.instagram,
  users.pubkey,
  users.info,
  users.confidential,
  users.blindkey,
  users.twitch,
  users.tiktok,
  users.discord,
  users.facebook,
  users.youtube,
  users.last_seen_tx
FROM
  users;
=======
CREATE OR REPLACE VIEW "public"."currentuser" AS 
 SELECT users.id,
    users.created_at,
    users.updated_at,
    users.display_name,
    users.avatar_url,
    users.username,
    users.location,
    users.bio,
    users.website,
    users.email,
    users.full_name,
    users.mnemonic,
    users.address,
    users.multisig,
    users.is_artist,
    users.is_admin,
    users.wallet_initialized,
    users.twitter,
    users.instagram,
    users.pubkey,
    users.info,
    users.confidential,
    users.blindkey,
    users.last_seen_tx
   FROM users;
>>>>>>> 36b0a351... utxos table and last seen tx column
