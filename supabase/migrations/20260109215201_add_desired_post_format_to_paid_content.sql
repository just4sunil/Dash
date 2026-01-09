/*
  # Add desired_post_format field to paid_content table

  ## Overview
  This migration adds a new field to store the desired post format (Text Only, Image + Text, Video Post)
  for paid content campaigns, matching the functionality from the content creation page.

  ## Changes
  
  ### Modified Tables
  - `paid_content`
    - Added `desired_post_format` (text) - The format preference for the ad content
      Options: "Text Only", "Image + Text", "Video Post"

  ## Important Notes
  1. This field is optional to maintain compatibility with existing records
  2. New records should include this field for better content generation
*/

-- Add desired_post_format column to paid_content table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paid_content' AND column_name = 'desired_post_format'
  ) THEN
    ALTER TABLE paid_content ADD COLUMN desired_post_format text;
  END IF;
END $$;
