/*
  # Add Media Ready Status and User Upload Tracking

  1. New Columns
    - `is_media_ready` (boolean)
      - Tracks whether user-uploaded media has been processed by webhook
      - Default: false
      - Used to control when uploaded media is displayed to user
    
    - `user_uploaded_image_url` (text, nullable)
      - Stores the URL of user-uploaded images
      - Separate from AI-generated image URLs
      - Only populated when user selects "Upload My Own" for Image + Text
    
    - `user_uploaded_video_url` (text, nullable)
      - Stores the URL of user-uploaded videos
      - Separate from AI-generated video URLs
      - Only populated when user selects "Upload My Own" for Video Post

  2. Changes
    - Added is_media_ready to content_drafts table with default false
    - Added user_uploaded_image_url to track user image uploads separately
    - Added user_uploaded_video_url to track user video uploads separately

  3. Notes
    - is_media_ready prevents premature display of unprocessed user media
    - Webhook must set is_media_ready to true after processing completes
    - User uploads stored separately to preserve AI-generated content
    - When is_media_ready is true, user uploads override AI-generated media in UI
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'is_media_ready'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN is_media_ready boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'user_uploaded_image_url'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN user_uploaded_image_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_drafts' AND column_name = 'user_uploaded_video_url'
  ) THEN
    ALTER TABLE content_drafts ADD COLUMN user_uploaded_video_url text;
  END IF;
END $$;