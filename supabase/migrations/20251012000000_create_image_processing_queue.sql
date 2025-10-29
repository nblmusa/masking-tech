-- Create image_processing_queue table for async image processing
CREATE TABLE IF NOT EXISTS image_processing_queue (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  error_message TEXT,
  progress FLOAT DEFAULT 0,
  estimated_completion_time TIMESTAMPTZ,
  
  -- Add indexes for common queries
  CONSTRAINT image_processing_queue_user_id_idx UNIQUE (id, user_id)
);

-- Create index on status for finding pending jobs
CREATE INDEX IF NOT EXISTS image_processing_queue_status_idx ON image_processing_queue (status);

-- Create index on user_id for finding user's jobs
CREATE INDEX IF NOT EXISTS image_processing_queue_user_id_idx ON image_processing_queue (user_id);

-- Create RLS policies for image_processing_queue
ALTER TABLE image_processing_queue ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own jobs
CREATE POLICY "Users can view their own jobs" 
  ON image_processing_queue 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to insert their own jobs
CREATE POLICY "Users can insert their own jobs" 
  ON image_processing_queue 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own jobs
CREATE POLICY "Users can update their own jobs" 
  ON image_processing_queue 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow service role to access all jobs (for background processing)
CREATE POLICY "Service role can access all jobs" 
  ON image_processing_queue 
  FOR ALL 
  USING (auth.role() = 'service_role');
