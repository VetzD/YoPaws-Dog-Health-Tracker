import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eydivurcorawilrokohzq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZHZpdXJjb3Jhd2xyb2tvaHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjgyNTUsImV4cCI6MjA4OTA0NDI1NX0.BJ1qKVpSnZgjATYCIgyXpKB2OXikMLpM9eUFLj-xhq0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
