/*
  # Create AI Images Storage Bucket

  1. New Storage Bucket
    - Creates `ai-images` bucket for storing AI-generated images
    - Bucket is set to public for easy access to generated images

  2. Security
    - Authenticated users can upload images (INSERT)
    - Everyone can view images (SELECT)
    - Only authenticated users can update their own images
    - Only authenticated users can delete their own images
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-images', 'ai-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload AI images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ai-images');

CREATE POLICY "Anyone can view AI images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ai-images');

CREATE POLICY "Users can update their own AI images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'ai-images' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'ai-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own AI images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'ai-images' AND auth.uid()::text = (storage.foldername(name))[1]);
