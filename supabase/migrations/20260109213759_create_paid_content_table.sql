/*
  # Create paid_content table

  ## Overview
  This migration creates the paid_content table for storing paid ad campaign content generation requests.
  Each record represents a user's paid content campaign with all parameters needed for AI-generated ad content.

  ## New Tables
  
  ### `paid_content`
  - `id` (uuid, primary key) - Unique identifier for each paid content record
  - `user_id` (uuid, foreign key) - References auth.users, identifies the record owner
  - `created_at` (timestamptz) - Timestamp when the record was created
  - `updated_at` (timestamptz) - Timestamp when the record was last updated
  
  ### Campaign & Objective
  - `campaign_name` (text, not null) - Name of the campaign
  - `primary_goal` (text, not null) - Brand Awareness, Traffic, Leads, Sales, App Installs
  - `target_platform` (text, not null) - Meta, TikTok, Google/YouTube, LinkedIn, X
  
  ### Audience Definition
  - `audience_type` (text, not null) - Cold, Warm, Retargeting
  - `audience_characteristics` (text) - Interests, pain points, desires
  - `age_range` (text) - Optional age range
  - `gender` (text) - Optional gender targeting
  - `location` (text) - Optional location targeting
  - `language` (text) - Optional language preference
  
  ### Budget & Duration
  - `budget_type` (text, not null) - Daily or Lifetime
  - `budget_amount` (decimal) - Budget amount
  - `start_date` (date) - Campaign start date
  - `end_date` (date) - Campaign end date
  - `optimization_preference` (text) - Conversions, Reach, Engagement, Lowest Cost
  
  ### Creative Direction
  - `content_idea` (text, not null) - The core content concept
  - `brand_tone` (text) - Professional, Friendly, Bold, Luxury, Playful
  - `cta_objective` (text) - Learn More, Buy Now, Sign Up, Download, Contact Us
  - `visual_style` (text) - Product-focused, Lifestyle, UGC, Minimal, Bold
  
  ### Output Preferences
  - `generate_ad_copy` (boolean, default true) - Generate ad copy
  - `generate_headlines` (boolean, default true) - Generate headlines
  - `generate_cta_text` (boolean, default true) - Generate CTA text
  - `generate_image_prompt` (boolean, default true) - Generate image prompt
  - `generate_video_hooks` (boolean, default true) - Generate video hook ideas
  - `number_of_variations` (integer, default 3) - Number of variations to generate
  
  ### Generated Content
  - `generated_ad_copy` (jsonb) - Array of generated ad copy variations
  - `generated_headlines` (jsonb) - Array of generated headline variations
  - `generated_cta_texts` (jsonb) - Array of generated CTA text variations
  - `generated_image_prompts` (jsonb) - Array of image prompts
  - `generated_video_hooks` (jsonb) - Array of video hook/script ideas
  - `generation_status` (text, default 'draft') - draft, generating, completed, failed

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the paid_content table
  - Users can only view their own paid content records
  - Users can only insert records associated with their own user_id
  - Users can only update their own paid content records
  - Users can only delete their own paid content records
  
  ## Indexes
  - Primary index on id
  - Index on user_id for efficient user-specific queries
  - Index on created_at for chronological sorting
  - Index on campaign_name for searching

  ## Important Notes
  1. All records are associated with authenticated users only
  2. Generated content is stored as JSONB for flexibility
  3. Default status is 'draft' for all new records
  4. Optional fields can be null
*/

-- Create paid_content table
CREATE TABLE IF NOT EXISTS paid_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Campaign & Objective
  campaign_name text NOT NULL,
  primary_goal text NOT NULL,
  target_platform text NOT NULL,
  
  -- Audience Definition
  audience_type text NOT NULL,
  audience_characteristics text,
  age_range text,
  gender text,
  location text,
  language text,
  
  -- Budget & Duration
  budget_type text NOT NULL,
  budget_amount decimal,
  start_date date,
  end_date date,
  optimization_preference text,
  
  -- Creative Direction
  content_idea text NOT NULL,
  brand_tone text,
  cta_objective text,
  visual_style text,
  
  -- Output Preferences
  generate_ad_copy boolean DEFAULT true,
  generate_headlines boolean DEFAULT true,
  generate_cta_text boolean DEFAULT true,
  generate_image_prompt boolean DEFAULT true,
  generate_video_hooks boolean DEFAULT true,
  number_of_variations integer DEFAULT 3,
  
  -- Generated Content
  generated_ad_copy jsonb,
  generated_headlines jsonb,
  generated_cta_texts jsonb,
  generated_image_prompts jsonb,
  generated_video_hooks jsonb,
  generation_status text DEFAULT 'draft' NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS paid_content_user_id_idx ON paid_content(user_id);
CREATE INDEX IF NOT EXISTS paid_content_created_at_idx ON paid_content(created_at DESC);
CREATE INDEX IF NOT EXISTS paid_content_campaign_name_idx ON paid_content(campaign_name);

-- Enable Row Level Security
ALTER TABLE paid_content ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own paid content
CREATE POLICY "Users can view own paid content"
  ON paid_content
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own paid content
CREATE POLICY "Users can insert own paid content"
  ON paid_content
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own paid content
CREATE POLICY "Users can update own paid content"
  ON paid_content
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own paid content
CREATE POLICY "Users can delete own paid content"
  ON paid_content
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);