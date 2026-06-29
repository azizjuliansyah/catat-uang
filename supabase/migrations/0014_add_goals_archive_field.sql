-- Add is_archived field to saving_goals table
ALTER TABLE saving_goals
ADD COLUMN is_archived BOOLEAN DEFAULT false NOT NULL;

-- Add comment
COMMENT ON COLUMN saving_goals.is_archived IS 'Indicates whether the goal is archived';
