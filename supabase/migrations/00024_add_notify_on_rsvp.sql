-- Add notification preference for RSVP responses
ALTER TABLE parties ADD COLUMN notify_on_rsvp BOOLEAN DEFAULT true;
