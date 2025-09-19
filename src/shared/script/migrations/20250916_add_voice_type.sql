-- Migration: Allow VOICE in message.type_message CHECK constraint
-- Safe for re-run: drops the existing CHECK and re-creates it with VOICE included

DO $$
BEGIN
  BEGIN
    ALTER TABLE message DROP CONSTRAINT IF EXISTS message_type_message_check;
  EXCEPTION WHEN undefined_table THEN
    -- table does not exist; ignore for environments without the table
    NULL;
  END;

  BEGIN
    ALTER TABLE message
      ADD CONSTRAINT message_type_message_check
      CHECK (type_message IN ('TEXTE','IMAGE','FICHIER','SYSTEME','VOICE'));
  EXCEPTION WHEN undefined_table THEN
    -- table does not exist; ignore for environments without the table
    NULL;
  END;
END$$;


