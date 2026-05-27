-- Migration: Add event details columns to activities table
-- Run this in your database to extend the activities table with proper event fields
ALTER TABLE activities
  ADD COLUMN event_date DATE DEFAULT NULL AFTER is_active,
  ADD COLUMN event_time TIME DEFAULT NULL AFTER event_date,
  ADD COLUMN location TEXT DEFAULT NULL AFTER event_time,
  ADD COLUMN event_image TEXT DEFAULT NULL AFTER location;

-- Add indexes for new date/location fields
ALTER TABLE activities
  ADD INDEX idx_event_date (event_date),
  ADD INDEX idx_location (location(255));
