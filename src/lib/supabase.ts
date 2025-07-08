import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://szdlboesmkgmpngokfvo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZGxib2VzbWtnbXBuZ29rZnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzExMTMsImV4cCI6MjA2NzQwNzExM30.Joaq8Wns3zqK8b86OUtO0kAt4bYzKJ2mdoNCSvXZghw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    }
  }
})