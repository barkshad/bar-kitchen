import { createClient } from '@supabase/supabase-js';

// Supabase Credentials
const SUPABASE_URL = 'https://cgqftualdvtmufpeerr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZ2dmdHVhbGR2dG11ZmVwZWVyciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzE4ODkyNjAwLCJleHAiOjIwMzQ0Njg2MDB9.iG_p_fNf1N634N-0n70yE9S7A1X0K3W2U9F7G4H5J6K';

/**
 * PRODUCTION NOTE:
 * In a production environment, you should store these keys in a .env file:
 * VITE_SUPABASE_URL=...
 * VITE_SUPABASE_ANON_KEY=...
 */

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * ==========================================================
 * SQL SETUP SCRIPT (Run this in your Supabase SQL Editor):
 * ==========================================================
 * 
 * -- Create the settings table
 * CREATE TABLE IF NOT EXISTS site_settings (
 *   key TEXT PRIMARY KEY,
 *   content JSONB NOT NULL,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable Row Level Security
 * ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
 * 
 * -- Create Public Access Policies (Required for the app to function)
 * CREATE POLICY "Allow public read" ON site_settings FOR SELECT USING (true);
 * CREATE POLICY "Allow public insert" ON site_settings FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Allow public update" ON site_settings FOR UPDATE USING (true);
 * CREATE POLICY "Allow public delete" ON site_settings FOR DELETE USING (true);
 * 
 * ==========================================================
 */