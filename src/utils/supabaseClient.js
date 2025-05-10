import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rmkyhpquximlbknxefeh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJta3locHF1eGltbGJrbnhlZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODkzNzUsImV4cCI6MjA2MjQ2NTM3NX0.dAXhTldztIQM4a98hbbSlbbxROtXC9BRF60RLO9sqk0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
