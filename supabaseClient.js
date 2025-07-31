import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fdsedmqvonfsegyfvqwq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2VkbXF2b25mc2VneWZ2cXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA3MTUsImV4cCI6MjA2NzAxNjcxNX0.85AKLlUGAtOsLm8Om6rx19ZpPBYF8kf3xrL6NiTPCME'

export const supabase = createClient(supabaseUrl, supabaseKey)
