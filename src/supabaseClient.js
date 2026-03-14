import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eydviurcorawilrokohzq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZHZpdXJjb3Jhd2lscm9rb2h6cSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzczNDY4MjU1LCJleHAiOjIwODkwNDQyNTV9.BJ1qKVpSnZgjATYCIgyXpKB2OXikMLpM9eUFLj-xhq0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
