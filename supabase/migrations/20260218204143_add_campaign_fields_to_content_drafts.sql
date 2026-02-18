/*
  # Add campaign fields to content_drafts table

  1. Changes
    - Add `campaign_name` column to store the name of the campaign
    - Add `campaign_id` column to store a unique identifier for the campaign

  2. Purpose
    - Enable tracking and grouping of content by campaign
    - Support campaign-based content organization
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'campaign_name'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN campaign_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN campaign_id uuid;
  END IF;
END $$;
