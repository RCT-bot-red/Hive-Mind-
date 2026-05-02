 import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtlhntkkfrncnwukasxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bGhudGtrZnJuY253dWthc3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODYxOTYsImV4cCI6MjA5MzA2MjE5Nn0.cOH-dBqKWgITvAwYvBPGvvefQoXYvifS2YG4MIH8024'

export const supabase = createClient(supabaseUrl, supabaseKey)
