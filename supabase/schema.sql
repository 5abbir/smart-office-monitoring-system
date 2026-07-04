-- Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  room TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL,
  wattage INTEGER NOT NULL,
  "lastChanged" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  room TEXT NOT NULL,
  message TEXT NOT NULL,
  "triggeredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Realtime for the devices and alerts tables if needed, 
-- though we will be using the backend to broadcast via Socket.io instead of Supabase Realtime to adhere to the spec.
