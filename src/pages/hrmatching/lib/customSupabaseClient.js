import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fikbdwvimbzdnqsrwiyr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2Jkd3ZpbWJ6ZG5xc3J3aXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAyNzIsImV4cCI6MjA2NzIwNjI3Mn0.ZlTOBOxCMCnF82VIGTEMO-Puf8qjolRHonb7rX-8PPk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);