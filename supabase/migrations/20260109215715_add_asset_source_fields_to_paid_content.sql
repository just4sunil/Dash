/*
  # Add asset source fields to paid_content table

  ## Overview
  This migration adds fields to support asset source selection and file uploads
  for paid content campaigns, matching the functionality from the content creation page.

  ## Changes
  
  ### Modified Tables
  - `paid_content`
    - Added `asset_source` (text) - Source of media assets: "AI Generate" or "Upload My Own"
    - Added `asset_file_name` (text) - Name of the uploaded file if user uploads their own
    - Added `user_uploaded_image_url` (text) - URL for user-uploaded images
    - Added `user_uploaded_video_url` (text) - URL for user-uploaded videos

  ## Important Notes
  1. These fields are optional to maintain compatibility with existing records
  2. asset_source is only relevant when desired_post_format is not "Text Only"
  3. URLs point to files in Supabase storage buckets
*/

-- Add asset source fields to paid_content table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paid_content' AND column_name = 'asset_source'
  ) THEN
    ALTER TABLE paid_content ADD COLUMN asset_source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paid_content' AND column_name = 'asset_file_name'
  ) THEN
    ALTER TABLE paid_content ADD COLUMN asset_file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paid_content' AND column_name = 'user_uploaded_image_url'
  ) THEN
    ALTER TABLE paid_content ADD COLUMN user_uploaded_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'paid_content' AND column_name = 'user_uploaded_video_url'
  ) THEN
    ALTER TABLE paid_content ADD COLUMN user_uploaded_video_url text;
  END IF;
END $$;
