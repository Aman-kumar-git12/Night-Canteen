import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://uoohqpwviqmxhvetlfgg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvb2hxcHd2aXFteGh2ZXRsZmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTAxNzEsImV4cCI6MjA3MzY4NjE3MX0.wX3lSlFKbV88dqQ_CG1hFpARyfLZZywwGrM58Pv1ImE'
const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase