/* ============================================================
   SUPABASE CONFIG
   Fill these two values in from your Supabase project:
   Dashboard → Project Settings → API
   ============================================================ */

const SUPABASE_URL = 'https://fdgtdfgeolltmdpzlnbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZ3RkZmdlb2xsdG1kcHpsbmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMjY5NDYsImV4cCI6MjEwMTkwMjk0Nn0.FYgEp2RwmDTv6SRNkpwxmRkq51ilMl0anc_tIUZbWAc';

// Shared client instance, used by both the client site and the admin panel.
// Requires the Supabase JS library <script> tag to be loaded before this file.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
