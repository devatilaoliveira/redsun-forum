-- Rebuild private username generation objects from scratch.
-- Do not drop the whole private schema; it may hold future app-owned objects.

CREATE SCHEMA IF NOT EXISTS private;

DROP FUNCTION IF EXISTS private.next_username(text);
DROP TABLE IF EXISTS private.username_counters;

CREATE TABLE private.username_counters (
  prefix text PRIMARY KEY,
  last_value integer NOT NULL DEFAULT 0
);

INSERT INTO private.username_counters (prefix, last_value)
VALUES ('Aventureiro', 0);

CREATE OR REPLACE FUNCTION private.next_username(username_prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_value integer;
BEGIN
  INSERT INTO private.username_counters (prefix, last_value)
  VALUES (username_prefix, 0)
  ON CONFLICT (prefix) DO NOTHING;

  UPDATE private.username_counters
  SET last_value = last_value + 1
  WHERE prefix = username_prefix
  RETURNING last_value INTO next_value;

  RETURN username_prefix || next_value;
END;
$$;
