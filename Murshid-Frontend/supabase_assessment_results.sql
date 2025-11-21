-- Assessment Results Table
-- Stores student assessment results and AI recommendations

-- Create the assessment_results table
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  results JSONB NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id 
ON public.assessment_results(user_id);

-- Create index for date queries
CREATE INDEX IF NOT EXISTS idx_assessment_results_taken_at 
ON public.assessment_results(taken_at DESC);

-- Enable Row Level Security
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own assessment results
CREATE POLICY "Users can view own assessment results"
ON public.assessment_results
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own assessment results
CREATE POLICY "Users can insert own assessment results"
ON public.assessment_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own assessment results
CREATE POLICY "Users can update own assessment results"
ON public.assessment_results
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own assessment results
CREATE POLICY "Users can delete own assessment results"
ON public.assessment_results
FOR DELETE
USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.assessment_results;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.assessment_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.assessment_results TO authenticated;
GRANT SELECT ON public.assessment_results TO anon;

-- Comments for documentation
COMMENT ON TABLE public.assessment_results IS 'Stores student career assessment results and AI-generated major recommendations';
COMMENT ON COLUMN public.assessment_results.id IS 'Unique identifier for the assessment result';
COMMENT ON COLUMN public.assessment_results.user_id IS 'Reference to the user who took the assessment';
COMMENT ON COLUMN public.assessment_results.results IS 'JSON object containing assessment answers and AI recommendations';
COMMENT ON COLUMN public.assessment_results.taken_at IS 'When the assessment was completed';
COMMENT ON COLUMN public.assessment_results.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.assessment_results.updated_at IS 'Record last update timestamp';

-- Example query to view results structure:
-- SELECT 
--   id,
--   user_id,
--   results->>'personalityProfile' as personality,
--   results->'recommendations' as recommendations,
--   taken_at
-- FROM public.assessment_results
-- WHERE user_id = auth.uid()
-- ORDER BY taken_at DESC
-- LIMIT 5;
