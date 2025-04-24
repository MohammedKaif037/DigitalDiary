-- Create diary entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS (Row Level Security)
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select only their own entries
CREATE POLICY "Users can view their own entries" 
  ON diary_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own entries
CREATE POLICY "Users can insert their own entries" 
  ON diary_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own entries
CREATE POLICY "Users can update their own entries" 
  ON diary_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own entries
CREATE POLICY "Users can delete their own entries" 
  ON diary_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_diary_entries_updated_at
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
